import fetch from "node-fetch";
import User from "../models/user.model";

import dotenv from "dotenv";
import { prompt } from "../utils/prompt";
import { EXCLUDED_FILES } from "../utils/excludedFiles";
import { GITHUB_API_URL } from "../utils/constants";

import { openai } from "../configs/openai.client";
dotenv.config();

class GithubService {
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
