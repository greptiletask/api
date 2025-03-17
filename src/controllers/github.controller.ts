import { Request, Response } from "express";
import githubService from "../services/github.service";

async function fetchGHUserController(req: Request, res: Response) {
  try {
    const token = req.query.ghToken as string;
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

    return res.json({
      data: repos,
      message: "Repositories fetched successfully",
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch repositories" });
  }
}

async function fetchBranchesController(req: Request, res: Response) {
  try {
    const userSub = (req as any).userSub;
    const { owner, repo } = req.query;

    if (!userSub || !owner || !repo) {
      return res
        .status(400)
        .json({ error: "userSub, owner, repo are required" });
    }

    const branches = await githubService.fetchBranches(
      userSub,
      owner as string,
      repo as string
    );

    return res.json(branches);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch branches" });
  }
}

async function generateChangelogController(req: Request, res: Response) {
  try {
    const userSub = (req as any).userSub;
    const { owner, repo, start, end, version, response_style, branch } =
      req.body;

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
      end,
      version,
      response_style,
      branch
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

async function fetchCommitsController(req: Request, res: Response) {
  try {
    const userSub = (req as any).userSub;
    const { owner, repo, start, end, branch } = req.query;

    if (!userSub || !owner || !repo || !start || !end) {
      return res
        .status(400)
        .json({ error: "userSub, owner, repo, start, end are required" });
    }

    const commits = await githubService.fetchCommits(
      userSub,
      owner as string,
      repo as string,
      start as string,
      end as string,
      branch as string
    );

    if ((commits as any).error) {
      return res.status(400).json(commits);
    }

    return res.json(commits);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch commits" });
  }
}

export const GithubController = {
  fetchGHUserController,
  exchangeTokenController,
  updateAccessTokenController,
  fetchReposController,
  generateChangelogController,
  fetchCommitsController,
  fetchBranchesController,
};
