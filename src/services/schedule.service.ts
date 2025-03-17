import Schedule from "../models/schedule.model";
import { Schedule as ScheduleType } from "../../@types/schedule";

class ScheduleService {
  async createSchedule(schedule: ScheduleType) {
    try {
      const newSchedule = await Schedule.create(schedule);
      return newSchedule;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create schedule");
    }
  }

  async getSchedules(projectSlug: string) {
    try {
      const schedules = await Schedule.find({ projectSlug });
      return schedules;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get schedules");
    }
  }

  async updateSchedule(schedule: ScheduleType) {
    try {
      const existingSchedule = await Schedule.findOne({
        projectSlug: schedule.projectSlug,
        type: schedule.type,
      });
      if (!existingSchedule) {
        throw new Error("Schedule not found");
      }
      const updatedSchedule = await Schedule.findByIdAndUpdate(
        existingSchedule._id,
        { enabled: schedule.enabled },
        { new: true }
      );
      return updatedSchedule;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update schedule");
    }
  }

  async deleteSchedule(projectSlug: string, type: string) {
    try {
      await Schedule.findOneAndDelete({ projectSlug, type });
      return { message: "Schedule deleted successfully", status: 200 };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete schedule");
    }
  }
}

export default new ScheduleService();
