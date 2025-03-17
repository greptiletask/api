import { Request, Response } from "express";
import scheduleService from "../services/schedule.service";

async function createScheduleController(req: Request, res: Response) {
  const { projectSlug, type, enabled } = req.body;
  try {
    const schedule = await scheduleService.createSchedule({
      projectSlug,
      type,
      enabled,
    });
    return res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create schedule" });
  }
}

async function getSchedulesController(req: Request, res: Response) {
  const { projectSlug } = req.params;
  try {
    const schedules = await scheduleService.getSchedules(projectSlug);
    return res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get schedules" });
  }
}

async function updateScheduleController(req: Request, res: Response) {
  const { projectSlug, type, enabled } = req.body;
  try {
    const schedule = await scheduleService.updateSchedule({
      projectSlug,
      type,
      enabled,
    });
    return res.status(200).json(schedule);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update schedule" });
  }
}

async function deleteScheduleController(req: Request, res: Response) {
  const { projectSlug, type } = req.params;
  try {
    const result = await scheduleService.deleteSchedule(projectSlug, type);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete schedule" });
  }
}

export const ScheduleController = {
  createScheduleController,
  getSchedulesController,
  updateScheduleController,
  deleteScheduleController,
};
