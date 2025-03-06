import mongoose from "mongoose";
import { Changelog } from "../../@types/changelog";
const changelogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  projectSlug: { type: String, required: true },
  version: { type: String, required: true },
  changelog: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Changelog =
  mongoose.models.Changelog ||
  mongoose.model<Changelog>("Changelog", changelogSchema);

export default Changelog;
