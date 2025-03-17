import cron from "node-cron";
import Schedule from "../models/schedule.model";

async function generateChangelogsForSchedules(scheduleType: string) {
  const schedules = await Schedule.find({ type: scheduleType, enabled: true });
  const today = new Date();
  const lastFriday =
    today.getDay() === 5
      ? today
      : new Date(
          today.setDate(today.getDate() - ((today.getDay() + 1) % 7 || 7))
        );
  const firstOfTheMonth =
    today.getDate() === 1
      ? today
      : new Date(today.setMonth(today.getMonth() - 1, 1));

  switch (scheduleType) {
    case "daily":
      for (const schedule of schedules) {
        console.log(
          `[${new Date().toISOString()}] Generating changelog for project=${
            schedule.projectSlug
          }, type=${scheduleType}  for dates ${today.toISOString()} and ${today.toISOString()}`
        );
      }
      break;
    case "weekly":
      for (const schedule of schedules) {
        console.log(
          `[${new Date().toISOString()}] Generating changelog for project=${
            schedule.projectSlug
          }, type=${scheduleType}  for dates ${lastFriday.toISOString()} and ${today.toISOString()}`
        );
      }
      break;
    case "monthly":
      for (const schedule of schedules) {
        console.log(
          `[${new Date().toISOString()}] Generating changelog for project=${
            schedule.projectSlug
          }, type=${scheduleType}  for dates ${firstOfTheMonth.toISOString()} and ${today.toISOString()}`
        );
      }
      break;
  }
  for (const schedule of schedules) {
    console.log(
      `[${new Date().toISOString()}] Generating changelog for project=${
        schedule.projectSlug
      }, type=${scheduleType}`
    );
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
