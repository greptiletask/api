import { Request, Response } from "express";
import userService from "../services/user.service";

async function createUserController(req: Request, res: Response) {
  try {
    const userData = req.body;
    if (!userData) {
      return res.status(400).json({ error: "User data is required" });
    }

    const result = await userService.createUser(userData);
    if (result.status !== 200) {
      return res.status(result.status).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Error in createUserController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function fetchOrCreateUserController(req: Request, res: Response) {
  try {
    const { userSub } = req as any;
    console.log(userSub, "userSub from fetchOrCreateUserController");
    if (!userSub || typeof userSub !== "string") {
      return res.status(400).json({ error: "userSub is required" });
    }

    const result = await userService.fetchOrCreateUser(userSub);
    if (result.status !== 200) {
      return res.status(result.status).json({ error: result.message });
    }

    console.log(result, "result from fetchOrCreateUserController");
    return res.json(result);
  } catch (error) {
    console.error("Error in fetchOrCreateUserController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function fetchUserController(req: Request, res: Response) {
  try {
    const { userSub } = req as any;
    if (!userSub) {
      return res.status(400).json({ error: "User sub is required" });
    }

    const user = await userService.fetchUser(userSub);
    if ((user as any).error) {
      return res.status(404).json({ error: (user as any).error });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error in fetchUserController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const UserController = {
  createUserController,
  fetchOrCreateUserController,
  fetchUserController,
};
