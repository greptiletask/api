// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import githubRouter from "./routers/github.router";
import verifyToken from "./middleware/verifyToken";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/github", verifyToken, githubRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
