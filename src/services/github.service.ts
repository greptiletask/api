import fetch from "node-fetch";
import User from "../models/user.model";
import Changelog from "../models/changelog.model";
import dotenv from "dotenv";
import { prompt } from "../utils/prompt";
import { GITHUB_API_URL } from "../utils/constants";

import { openai } from "../configs/openai.client";
import { fetchUserRepos } from "../workers/fetch-repos";
import { fetchCommits, fetchCommitDiffs } from "../workers/fetch-diffs";
dotenv.config();

class GithubService {
  async fetchGHUser(ghToken: string) {
    const response = await fetch(`${GITHUB_API_URL}/user`, {
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

  async fetchRepos(userId: string) {
    const user = await User.findOne({ sub: userId });
    if (!user) {
      return { error: "User not found" };
    }
    const repos = await fetchUserRepos(user.accessToken);
    return repos;
  }

  async generateChangelog(
    userId: string,
    owner: string,
    repo: string,
    start: string,
    end: string
  ) {
    const user = await User.findOne({ sub: userId });
    if (!user) {
      return { error: "User not found" };
    }

    const commits = await fetchCommits({
      start,
      end,
      owner,
      repo,
      token: user.accessToken,
    });

    const commitDiffs = await Promise.all(
      commits.map((commit: any) =>
        fetchCommitDiffs(commit.sha, owner, repo, user.accessToken)
      )
    );

    const promptData = prompt(
      commits[0].sha,
      commits[commits.length - 1].sha,
      commitDiffs.join("\n")
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: promptData }],
      response_format: { type: "json_object" },
    });

    if (!response.choices[0].message.content) {
      return { error: "Failed to generate changelog" };
    }

    const changelog = JSON.parse(response.choices[0].message.content);

    const changeLogInDb = await Changelog.create({
      userId,
      changelog: response.choices[0].message.content,
    });

    return changeLogInDb;
  }
}

const githubService = new GithubService();

export default githubService;
