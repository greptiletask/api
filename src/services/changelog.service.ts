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
    projectSlug: string,
    title: string
  ) {
    console.log(
      changelog,
      version,
      repo,
      userSub,
      projectSlug,
      "[CREATE CHANGELOG]: CHANGELOG"
    );
    if (!changelog || !version || !repo || !userSub) {
      throw new Error("Missing required fields");
    }
    const projectFromDb = await Project.findOne({
      userId: userSub,
      slug: projectSlug,
    });
    if (!projectFromDb) {
      const project = await Project.create({
        userId: userSub,
        repoFullName: repo,
        customDomain: "",
        isDomainVerified: false,
        slug: projectSlug,
      });
      if (!project) {
        throw new Error("Failed to create project");
      }
    }
    const newChangelog = await Changelog.create({
      changelog,
      version,
      repo,
      userId: userSub,
      projectSlug: projectSlug,
      title,
    });
    if (!newChangelog) {
      throw new Error("Failed to create changelog");
    }
    console.log("Changelog created successfully", newChangelog);
    return newChangelog;
  }
  async getChangelogs(projectSlug: string) {
    const changelogs = await Changelog.find({
      projectSlug: projectSlug,
    });
    return changelogs;
  }

  async getProjects(userSub: string) {
    const projects = await Project.find({ userId: userSub });
    return projects;
  }

  async getProject(userSub: string, projectSlug: string) {
    console.log("[GET PROJECT]: PROJECT SLUG", projectSlug);
    const project = await Project.findOne({
      slug: projectSlug,
    });
    return project;
  }

  async addDomain(projectSlug: string, domain: string) {
    console.log("[ADD DOMAIN]: PROJECT SLUG", projectSlug, "DOMAIN", domain);
    const project = await Project.findOneAndUpdate(
      { slug: projectSlug },
      { customDomain: domain },
      { new: true }
    );
    console.log("[ADD DOMAIN]: PROJECT", project);
    return project;
  }
}

const changelogService = new ChangelogService();

export default changelogService;
