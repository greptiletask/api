import mongoose from "mongoose";
import { User } from "../../@types/user";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    accessToken: {
      type: String,
      required: false,
      default: null,
    },
    sub: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// userSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model<User>("User", userSchema);

export default User;
