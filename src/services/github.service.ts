import fetch from "node-fetch";
import User from "../models/User";
import ReviewedPR from "../models/ReviewedPR";
import DailyStat from "../models/DailyStat";
import { io } from "../index";
import dotenv from "dotenv";
import { prompt } from "../utils/prompt";
import { EXCLUDED_FILES } from "../utils/excludedFiles";
import { LANGUAGE_EXTENSIONS } from "../utils/languageExtensions";
import { GITHUB_API_URL } from "../utils/constants";
import { shouldRegenerateEmbeddings } from "../lib/workers/shouldRegenerate";
import { regenerateEmbeddings } from "../lib/workers/regenerateEmbeddings";
import { storeCodebaseState } from "../lib/workers/storeCBState";
import { fetchCodebaseContext } from "../lib/workers/fetchCodebaseContext";
import { rerankContext } from "../lib/workers/rerankContext";
import { openai } from "../lib/configs/openai.client";
dotenv.config();

class GithubService {
  async fetchPRCode(prUrl: string, userId: string) {
    try {
      console.log("userId from fetchPRCode", userId);

      const user = await User.findOne({ sub: userId });

      if (!user) {
        io.emit("error", { message: "User not found." });
        return { error: "User not found." };
      }

      const ghToken = user.accessToken;

      if (!ghToken) {
        io.emit("error", { message: "GitHub token is missing." });
        return { error: "GitHub token is missing." };
      }

      if (!prUrl || typeof prUrl !== "string") {
        io.emit("error", { message: "Invalid or missing PR link." });
        return { error: "Invalid or missing PR link." };
      }

      const prRegex = /https:\/\/github\.com\/([\w-]+)\/([\w.-]+)\/pull\/(\d+)/;
      console.log(prUrl, "PR URL");
      console.log(prRegex, "PR REGEX");
      const match = prUrl.match(prRegex);

      console.log(match, "MATCH");

      if (!match) {
        io.emit("error", { message: "Invalid PR link format." });
        return { error: "Invalid PR link format." };
      }

      const [_, owner, repo, pull_number] = match;

      console.log(
        _,
        owner,
        repo,
        pull_number,
        "OWNER REPO PULL NUMBER",
        ghToken
      );

      const prOrg = owner;
      const prRepo = repo;

      const prResponse = await fetch(
        `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${pull_number}`,
        {
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!prResponse.ok) {
        io.emit("error", { message: "Failed to fetch PR metadata." });
        return { error: "Failed to fetch PR metadata." };
      }

      const prData = await prResponse.json();
      const ref = prData.head.sha;

      console.log(ref, "REF");

      const regenerate = await shouldRegenerateEmbeddings();

      if (regenerate) {
        // Regenerate embeddings and update the stored commit hash
        // await regenerateEmbeddings(prOrg, prRepo, ghToken, ref);
        await storeCodebaseState();
      }

      // Fetch codebase context (using the updated function)
      const codebaseContext = await fetchCodebaseContext(
        prOrg,
        prRepo,
        ghToken,
        ref,
        regenerate
      );

      const filesResponse = await fetch(
        `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${pull_number}/files`,
        {
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!filesResponse.ok) {
        io.emit("error", { message: "Failed to fetch PR files." });
        return { error: "Failed to fetch PR files." };
      }

      const files = await filesResponse.json();

      // const prompt = ``;

      let totalTokensUsed = 0;
      let totalLinesOfCode = 0;
      const codeReviews = [];

      const fileFetchPromises = files.map(async (file: any) => {
        if (file.status !== "removed") {
          const filePath = file.filename;
          const fileKey = file.path;

          const languageExtension = filePath.split(".").pop();

          // console.log(languageExtension, "LANGUAGE EXTENSION");

          const language =
            LANGUAGE_EXTENSIONS[
              languageExtension as keyof typeof LANGUAGE_EXTENSIONS
            ];
          // console.log(language, "LANGUAGE6");

          if (!language) {
            console.log(
              `Skipping file: ${filePath} because language is not supported.`
            );
            return null;
          }

          const isExcluded = EXCLUDED_FILES.some((excludedFile) => {
            if (excludedFile.startsWith("*.")) {
              return filePath.endsWith(excludedFile.slice(1));
            }
            return excludedFile === filePath;
          });

          if (isExcluded) {
            console.log(`Skipping excluded file: ${filePath}`);
            return null;
          }

          io.emit("fileProcessing", { filePath });

          const contentResponse = await fetch(
            `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`,
            {
              headers: {
                Authorization: `Bearer ${ghToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          if (!contentResponse.ok) {
            console.warn(`Skipping file: ${filePath}`);
            return null;
          }

          const fileContent = await contentResponse.json();

          if (fileContent.content && fileContent.encoding === "base64") {
            const decodedContent = Buffer.from(
              fileContent.content,
              "base64"
            ).toString("utf-8");

            totalLinesOfCode += decodedContent.split("\n").length;

            let review = "";
            try {
              // console.log(
              //   "using updated prompt",
              //   prompt,
              //   "model being used is gpt-4o"
              // );
              // console.log(codebaseContext, "CODEBASE CONTEXT");
              const promptWithContext = `${prompt}\n\nFile Content:\n${decodedContent}`;
              const rerankedContext = await rerankContext(
                promptWithContext,
                codebaseContext,
                3,
                fileKey
              );
              console.log(rerankedContext, "RERANKED CONTEXT45");
              const promptWithRerankedContext = `${prompt}\n\nCodebase Context:\n${rerankedContext}\n\nFile Content:\n${decodedContent}`;

              await logToFile(
                "prompts.log",
                `Prompt with context: ${promptWithContext}`
              );

              await logToFile(
                "prompts.log",
                `Prompt with reranked context: ${promptWithRerankedContext}`
              );

              const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "user",
                    content: promptWithRerankedContext,
                  },
                ],
                max_tokens: Math.min(2000, decodedContent.length * 2),
                temperature: 0.7,
              });

              review =
                response.choices[0].message?.content || "No review available.";

              console.log(response.usage?.prompt_tokens, "input tokens used");
              await logToFile(
                "prompts.log",
                `Input tokens used: ${response.usage?.prompt_tokens}`
              );

              totalTokensUsed += response.usage?.total_tokens || 0;
            } catch (error) {
              console.error("Error with OpenAI API:", error);
              review = "Failed to generate a review.";
            }

            // try {
            //   console.log("using gemini");
            //   const model = googleGenerativeAI.getGenerativeModel({
            //     model: "gemini-2.0-flash",
            //   });
            //   const response = await model.generateContent(
            //     prompt + "\n\n" + decodedContent
            //   );

            //   review =
            //     response.response.candidates![0].content.parts![0].text ||
            //     "Failed to generate a review.";

            //   console.log(review, "REVIEW from gemini");
            // } catch (error) {
            //   console.error("Error with Google API:", error);
            //   review = "Failed to generate a review.";
            // }

            return { filePath, code: decodedContent, review, language };
          }
        }
        return null;
      });

      const reviewedFiles = (await Promise.all(fileFetchPromises)).filter(
        (file) => file !== null
      );

      codeReviews.push(...reviewedFiles);

      const reviewedPR = new ReviewedPR({
        userId,
        prId: prData.id,
        prUrl,
        prTitle: prData.title,
        prOrg,
        prRepo,
        codeReview: codeReviews,
      });

      await reviewedPR.save();

      // Update User statistics
      user.totalLinesOfCodeReviewed += totalLinesOfCode;
      user.totalPRsReviewed += 1;
      user.creditsUsed += totalTokensUsed;

      await user.save();

      // Record Daily Statistics
      const today = new Date().toISOString().split("T")[0];
      await DailyStat.findOneAndUpdate(
        { userId, date: today },
        {
          $inc: {
            linesReviewed: totalLinesOfCode,
            prsReviewed: 1,
          },
        },
        { upsert: true, new: true }
      );

      io.emit("reviewCompleted", { reviewedPRId: reviewedPR.prId });

      return {
        success: true,
        message: "Review saved successfully.",
        codeReviews,
        reviewedPRId: reviewedPR.prId,
      };
    } catch (error) {
      console.error(error);
      io.emit("error", {
        message: "Failed to fetch or save PR code and review.",
      });
      return { error: "Failed to fetch or save PR code and review." };
    }
  }

  async fetchGHUser(ghToken: string) {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${ghToken}`,
      },
    });
    const data = await response.json();
    return data;
  }

  async exchangeToken(code: string, userId: string) {
    try {
      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );

      const data = await tokenResponse.json();

      console.log(data, "DATA FROM GH CALLBACK");

      if (!data.access_token) {
        return { error: "Failed to get access token" };
      }

      const user = await User.findOne({ sub: userId });

      if (!user) {
        return { error: "User not found" };
      }

      const updatedUser = await User.findByIdAndUpdate(user._id, {
        accessToken: data.access_token,
      });

      if (!updatedUser) {
        return { error: "Failed to update user" };
      }

      return {
        status: 200,
        access_token: data.access_token,
      };
    } catch (error) {
      console.error(error, "ERROR FROM GH CALLBACK");
      return { error: "Failed to get access token" };
    }
  }

  async updateAccessToken(userId: string, accessToken: string) {
    if (!userId || !accessToken) {
      return { error: "Invalid request." };
    }
    const user = await User.findOneAndUpdate({ sub: userId }, { accessToken });
    return user;
  }
}

export default GithubService;
