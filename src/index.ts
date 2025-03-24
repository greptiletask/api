// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import githubRouter from "./routers/github.router";
import verifyToken from "./middleware/verifyToken";
import userRouter from "./routers/user.router";
import cors from "cors";
import connectDB from "./configs/db.config";
import changelogRouter from "./routers/changelog.router";
import bodyParser from "body-parser";
import scheduleRouter from "./routers/schedule.router";
import scanRouter from "./routers/scan.router";
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
app.use(bodyParser.json());

app.use("/api/user", verifyToken, userRouter);

app.use("/api/github", verifyToken, githubRouter);

app.use("/api/schedule", verifyToken, scheduleRouter);

app.use("/api/scan", scanRouter);

app.use("/api/changelog", changelogRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
