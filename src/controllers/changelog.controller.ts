import changelogService from "../services/changelog.service";
import { Request, Response } from "express";

async function createChangelogController(req: Request, res: Response) {
  const { changelog, version, repo, projectId } = req.body;
  const userSub = (req as any).userSub;
  const newChangelog = await changelogService.createChangelog(
    changelog,
    version,
    repo,
    userSub,
    projectId
  );
  return res.status(200).json(newChangelog);
}

async function getChangelogsController(req: Request, res: Response) {
  try {
    const { projectSlug } = req.params;
    const changelogs = await changelogService.getChangelogs(projectSlug);
    return res.status(200).json(changelogs);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get changelogs" });
  }
}

async function getProjectsController(req: Request, res: Response) {
  const userSub = (req as any).userSub;
  const projects = await changelogService.getProjects(userSub);
  return res.status(200).json(projects);
}

async function getProjectController(req: Request, res: Response) {
  const userSub = (req as any).userSub;
  const { projectSlug } = req.params;
  const project = await changelogService.getProject(userSub, projectSlug);
  return res.status(200).json(project);
}

export const ChangelogController = {
  createChangelogController,
  getChangelogsController,
  getProjectsController,
  getProjectController,
};
