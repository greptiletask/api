import { createClerkClient } from "@clerk/backend";
import dotenv from "dotenv";

dotenv.config();

export const clerkClient = createClerkClient({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});