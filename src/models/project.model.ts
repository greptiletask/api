import mongoose from "mongoose";
import { Project } from "../../@types/project";
const projectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  repoFullName: { type: String, required: true },
  customDomain: { type: String, required: false },
  isDomainVerified: { type: Boolean, default: false },
  verificationToken: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  slug: { type: String, required: true, unique: true },
});

const Project =
  mongoose.models.Project || mongoose.model<Project>("Project", projectSchema);

export default Project;
