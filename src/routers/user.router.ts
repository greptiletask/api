import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();

/**
 * POST /user
 * Creates a new user (or returns existing user if sub already exists).
 */
router.post("/", async (req, res) => {
  await UserController.createUserController(req, res);
});

/**
 * GET /user/fetch-or-create?userSub=<id>
 * Checks if user exists in DB; if not, creates a new user from Clerk data.
 */
router.get("/fetch-or-create", async (req, res) => {
  await UserController.fetchOrCreateUserController(req, res);
});

/**
 * GET /user/:sub
 * Fetch a user by sub (user identifier).
 */
router.get("/", async (req, res) => {
  await UserController.fetchUserController(req, res);
});

export default router;
