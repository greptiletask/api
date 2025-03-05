// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import githubRouter from "./routers/github.router";
import verifyToken from "./middleware/verifyToken";
import userRouter from "./routers/user.router";
import cors from "cors";
import connectDB from "./configs/db.config";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8001;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

connectDB();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", verifyToken, userRouter);

app.use("/api/github", verifyToken, githubRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
