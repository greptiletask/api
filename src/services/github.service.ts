import fetch from "node-fetch";
import User from "../models/user.model";
import Changelog from "../models/changelog.model";
import dotenv from "dotenv";
import { prompt } from "../utils/prompt";
import { GITHUB_API_URL } from "../utils/constants";

import { openai } from "../configs/openai.client";
import { fetchUserRepos } from "../workers/fetch-repos";
import { fetchCommits, fetchCommitDiffs } from "../workers/fetch-diffs";
import { logToFile } from "../utils/log";
dotenv.config();

class GithubService {
  async fetchGHUser(ghToken: string) {
    console.log(ghToken, "GH TOKEN from fetchGHUser");
    try {
      const response = await fetch(`${GITHUB_API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${ghToken}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error, "ERROR FROM GH USER");
      return { error: "Failed to fetch GitHub user" };
    }
  }

  async exchangeToken(code: string, userSub: string) {
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

      const user = await User.findOne({ sub: userSub });

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

  async updateAccessToken(userSub: string, accessToken: string) {
    console.log(userSub, accessToken, "USER SUB AND ACCESS TOKEN");
    if (!userSub || !accessToken) {
      return { error: "Invalid request." };
    }
    const user = await User.findOneAndUpdate({ sub: userSub }, { accessToken });
    return user;
  }

  async fetchRepos(userSub: string) {
    const user = await User.findOne({ sub: userSub });
    if (!user) {
      return { error: "User not found" };
    }
    const repos = await fetchUserRepos(user.accessToken);
    return repos;
  }

  async fetchCommits(
    userSub: string,
    owner: string,
    repo: string,
    start: string,
    end: string
  ) {
    const user = await User.findOne({ sub: userSub });
    if (!user) {
      return { error: "User not found" };
    }
    try {
      const commits = await fetchCommits({
        start,
        end,
        owner,
        repo,
        token: user.accessToken,
      });
      return commits;
    } catch (error) {
      console.error(error, "ERROR FROM FETCH COMMITS");
      return { error: "Failed to fetch commits" };
    }
  }

  async generateChangelog(
    userSub: string,
    owner: string,
    repo: string,
    start: string,
    end: string,
    version: string,
    response_style: string
  ) {
    try {
      const user = await User.findOne({ sub: userSub });
      if (!user) {
        return { error: "User not found" };
      }

      console.log(start, end, owner, repo, "START AND END AND OWNER AND REPO");
      await logToFile(
        "changelog.log",
        `start: ${start}, end: ${end}, owner: ${owner}, repo: ${repo}`
      );

      const commits = await fetchCommits({
        start,
        end,
        owner,
        repo,
        token: user.accessToken,
      });
      await logToFile(
        "changelog.log",
        `commits: ${JSON.stringify(commits.slice(0, 10))}`
      );

      const commitDiffs = await Promise.all(
        commits.map((commit: any) =>
          fetchCommitDiffs(commit.sha, owner, repo, user.accessToken)
        )
      );

      const promptData = prompt(
        start,
        end,
        commitDiffs.join("\n"),
        response_style
      );

      await logToFile(
        "changelog.log",
        `promptData: ${JSON.stringify(promptData)}`
      );

      // console.log(promptData, "[GENERATE FLOW]: PROMPT DATA");

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptData }],
        response_format: { type: "json_object" },
      });

      if (!response.choices[0].message.content) {
        return { error: "Failed to generate changelog" };
      }

      const changelog = JSON.parse(response.choices[0].message.content);

      await logToFile(
        "changelog.log",
        `changelog: ${JSON.stringify(changelog)}`
      );

      console.log(changelog, "[GENERATE FLOW]: CHANGELOG");

      return {
        changelog: response.choices[0].message.content,
      };
    } catch (error) {
      console.error(error, "ERROR FROM GENERATE CHANGELOG");
      return { error: "Failed to generate changelog" };
    }
  }
}

const githubService = new GithubService();

export default githubService;
