import { decodeJwt } from "@clerk/backend/jwt";
import { clerkClient } from "../configs/auth.config";
import { NextFunction, Response } from "express";

export const verifyToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  console.log(token, "token from middleware");
  const decodedToken = await decodeJwt(token);
  console.log(decodedToken, "decodedToken from middleware");
  const userId = decodedToken.payload.sub;
  console.log(userId, "userId from middleware");
  const user = await clerkClient.users.getUser(userId!);
  console.log(user, "user from middleware");

  if (!user) {
    next();
  }

  console.log(user, "from middleware");
  // console.log(req, "from middleware");
  req.userSub = user.id;
  next();
};
