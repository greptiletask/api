import cron from "node-cron";
import Schedule from "../models/schedule.model";
import Project from "../models/project.model";
import githubService from "../services/github.service";
import changelogService from "../services/changelog.service";
import { parseDateString } from "../utils/dateStringParser";
async function generateChangelogsForSchedules(scheduleType: string) {
  const schedules = await Schedule.find({ type: scheduleType, enabled: true });

  const today = new Date();
  let startDateParam: string = "";
  let endDateParam: string = "";

  switch (scheduleType) {
    case "daily":
      startDateParam = parseDateString(today.toISOString());
      endDateParam = parseDateString(startDateParam);
      break;
    case "weekly":
      startDateParam =
        today.getDay() === 5
          ? parseDateString(today.toISOString())
          : parseDateString(
              new Date(
                today.setDate(today.getDate() - ((today.getDay() + 1) % 7 || 7))
              ).toISOString()
            );
      endDateParam = parseDateString(startDateParam);
      break;
    case "monthly":
      startDateParam =
        today.getDate() === 1
          ? parseDateString(today.toISOString())
          : parseDateString(
              new Date(today.setMonth(today.getMonth() - 1, 1)).toISOString()
            );
      endDateParam = parseDateString(startDateParam);
      break;
  }
  for (const schedule of schedules) {
    const project = await Project.findOne({ slug: schedule.projectSlug });
    if (!project) {
      console.error(`Project not found for schedule ${schedule.projectSlug}`);
      continue;
    }

    const changelog = await githubService.generateChangelog(
      project.userSub,
      project.owner,
      project.repo,
      startDateParam,
      endDateParam,
      `v${parseDateString(today.toISOString())}`,
      "non-technical",
      "main"
    );
    console.log(changelog);
    if (!changelog.changelog) {
      console.error(`Changelog not found for project ${schedule.projectSlug}`);
      continue;
    }
    const publishChangelog = await changelogService.createChangelog(
      JSON.parse(changelog.changelog).summaryBulletPoints,
      `v${parseDateString(today.toISOString())}`,
      project.repo,
      project.userSub,
      project.slug,
      JSON.parse(changelog.changelog).title
    );
    console.log(publishChangelog);
  }
}

function setupCronJobs() {
  cron.schedule("59 23 * * *", async () => {
    console.log("Running daily cron job @ 23:59 UTC");
    await generateChangelogsForSchedules("daily");
  });

  cron.schedule("59 23 * * 5", async () => {
    console.log("Running weekly cron job @ Friday 23:59 UTC");
    await generateChangelogsForSchedules("weekly");
  });

  cron.schedule("59 23 1 * *", async () => {
    console.log("Running monthly cron job @ 1st day 23:59 UTC");
    await generateChangelogsForSchedules("monthly");
  });

  console.log("Cron jobs scheduled: daily, weekly, monthly.");
}

module.exports = { setupCronJobs };
