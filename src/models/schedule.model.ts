// models/Schedule.js
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  projectSlug: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Schedule =
  mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);

export default Schedule;
