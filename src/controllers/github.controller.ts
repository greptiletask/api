import { Request, Response } from "express";
import githubService from "../services/github.service";
import userService from "../services/user.service";

async function fetchGHUserController(req: Request, res: Response) {
  try {
    const userSub = (req as any).userSub;
    const user = await userService.fetchUser(userSub);
    const token = user.accessToken;
    if (!token) {
      return res.status(400).json({ error: "GitHub token is required" });
    }

    const data = await githubService.fetchGHUser(token);
    if (data.error) {
      return res.status(400).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch GitHub user" });
  }
}

async function exchangeTokenController(req: Request, res: Response) {
  try {
    const userSub = (req as any).userSub;
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const result = await githubService.exchangeToken(code, userSub);
    if (result.error) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to exchange token" });
  }
}

async function updateAccessTokenController(req: Request, res: Response) {
  try {
    const userSub = (req as any).userSub;
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const updatedUser = await githubService.updateAccessToken(
      userSub,
      accessToken
    );
    if (!updatedUser || (updatedUser as any).error) {
      return res.status(400).json({ error: "Failed to update access token" });
    }

    return res.json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update access token" });
  }
}

async function fetchReposController(req: Request, res: Response) {
  try {
    const userSub = (req as any).userSub;

    const repos = await githubService.fetchRepos(userSub);
    if ((repos as any).error) {
      return res.status(400).json(repos);
    }

    return res.json(repos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch repositories" });
  }
}

async function generateChangelogController(req: Request, res: Response) {
  try {
    const userSub = (req as any).userSub;
    const { owner, repo, start, end } = req.body;

    if (!userSub || !owner || !repo || !start || !end) {
      return res
        .status(400)
        .json({ error: "userSub, owner, repo, start, end are required" });
    }

    const changelog = await githubService.generateChangelog(
      userSub,
      owner,
      repo,
      start,
      end
    );

    if ((changelog as any).error) {
      return res.status(400).json(changelog);
    }

    return res.json(changelog);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate changelog" });
  }
}

export const GithubController = {
  fetchGHUserController,
  exchangeTokenController,
  updateAccessTokenController,
  fetchReposController,
  generateChangelogController,
};
