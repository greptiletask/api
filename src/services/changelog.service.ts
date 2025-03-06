import Changelog from "../models/changelog.model";
import Project from "../models/project.model";
import dns from "dns/promises";
import crypto from "crypto";

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
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const project = await Project.findOneAndUpdate(
      { slug: projectSlug },
      { customDomain: domain, verificationToken },
      { new: true }
    );
    console.log("[ADD DOMAIN]: PROJECT", project);
    return project;
  }

  async verifyDomain(userSub: string, projectSlug: string) {
    // 1) Find the project
    const project = await Project.findOne({
      slug: projectSlug,
      userId: userSub,
    });
    if (!project) {
      throw new Error("Project not found or you do not own it");
    }
    if (!project.customDomain) {
      throw new Error("No custom domain set");
    }
    if (!project.verificationToken) {
      throw new Error("No verification token");
    }

    const domain = project.customDomain.trim().toLowerCase();
    let txtRecords: any;
    try {
      txtRecords = await dns.resolveTxt(domain);
    } catch (err) {
      console.error("[VERIFY DOMAIN] DNS Error:", err);
      throw new Error("DNS lookup failed");
    }

    console.log("[VERIFY DOMAIN] TXT RECORDS", txtRecords);
    if (!txtRecords) {
      throw new Error("No TXT records found");
    }

    const flattened = txtRecords.map((arr: any) => arr.join("").trim());
    console.log("[VERIFY DOMAIN] FLATTENED", flattened);

    if (!flattened.includes(project.verificationToken)) {
      throw new Error("Token not found in DNS TXT records");
    }

    const updatedProject = await Project.findOneAndUpdate(
      { slug: projectSlug },
      { isDomainVerified: true },
      { new: true }
    );
    console.log("[VERIFY DOMAIN] UPDATED PROJECT", updatedProject);
    return updatedProject;
  }
}

const changelogService = new ChangelogService();

export default changelogService;
