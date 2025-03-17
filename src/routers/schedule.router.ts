import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";

const router = Router();

router.post("/", (req, res) => {
  ScheduleController.createScheduleController(req, res);
});
router.get("/:projectSlug", (req, res) => {
  ScheduleController.getSchedulesController(req, res);
});
router.put("/:projectSlug", (req, res) => {
  ScheduleController.updateScheduleController(req, res);
});
router.delete("/:projectSlug", (req, res) => {
  ScheduleController.deleteScheduleController(req, res);
});

export default router;
