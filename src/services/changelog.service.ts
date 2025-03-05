import Changelog from "../models/changelog.model";
import Project from "../models/project.model";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
class ChangelogService {
  async createChangelog(
    changelog: string,
    version: string,
    repo: string,
    userSub: string,
    projectId: string
  ) {
    console.log(changelog, "[CREATE CHANGELOG]: CHANGELOG");
    if (!changelog || !version || !repo || !userSub) {
      throw new Error("Missing required fields");
    }
    let projectIdToUse = projectId;
    if (!projectId) {
      const project = await Project.create({
        projectId: uuidv4(),
        userId: userSub,
        repoFullName: repo,
        customDomain: "",
        isDomainVerified: false,
        slug: slugify(repo),
      });
      if (!project) {
        throw new Error("Failed to create project");
      }
      projectIdToUse = project.projectId;
    }
    const newChangelog = await Changelog.create({
      changelog,
      version,
      repo,
      userId: userSub,
      projectId: projectIdToUse,
    });
    if (!newChangelog) {
      throw new Error("Failed to create changelog");
    }
    console.log("Changelog created successfully", newChangelog);
    return newChangelog;
  }
  async getChangelogs(projectSlug: string) {
    const changelogs = await Changelog.find({
      slug: projectSlug,
    });
    return changelogs;
  }

  async getProjects(userSub: string) {
    const projects = await Project.find({ userId: userSub });
    return projects;
  }

  async getProject(userSub: string, projectSlug: string) {
    const project = await Project.findOne({
      userId: userSub,
      slug: projectSlug,
    });
    return project;
  }
}

const changelogService = new ChangelogService();

export default changelogService;
