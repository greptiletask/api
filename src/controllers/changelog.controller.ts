import changelogService from "../services/changelog.service";
import { Request, Response } from "express";

async function createChangelogController(req: Request, res: Response) {
  const { changelog, version, repo, projectSlug, title } = req.body;
  const userSub = (req as any).userSub;
  const newChangelog = await changelogService.createChangelog(
    changelog,
    version,
    repo,
    userSub,
    projectSlug,
    title
  );
  return res.status(200).json({
    message: "Changelog created successfully",
    changelog: newChangelog,
  });
}

async function getChangelogsController(req: Request, res: Response) {
  try {
    const { projectSlug } = req.params;
    const changelogs = await changelogService.getChangelogs(projectSlug);
    return res.status(200).json({
      changelogs: changelogs,
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get changelogs" });
  }
}

async function getProjectsController(req: Request, res: Response) {
  const userSub = (req as any).userSub;
  const projects = await changelogService.getProjects(userSub);
  return res.status(200).json({
    projects: projects,
    status: 200,
  });
}

async function getProjectController(req: Request, res: Response) {
  const userSub = (req as any).userSub;
  const { projectSlug } = req.params;
  const project = await changelogService.getProject(userSub, projectSlug);
  return res.status(200).json({
    project: project,
    status: 200,
  });
}

export const ChangelogController = {
  createChangelogController,
  getChangelogsController,
  getProjectsController,
  getProjectController,
};
