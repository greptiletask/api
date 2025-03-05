import { Router } from "express";
import { GithubController } from "../controllers/github.controller";

const router = Router();

/**
 * POST /github/exchange-token
 * Request body: { code, userId }
 */
router.post("/exchange-token", (req, res) => {
  GithubController.exchangeTokenController(req, res);
});

/**
 * POST /github/update-access-token
 * Request body: { userId, accessToken }
 */
router.post("/update-access-token", (req, res) => {
  GithubController.updateAccessTokenController(req, res);
});

/**
 * GET /github/user
 * Optional: pass the token in Authorization header (Bearer <token>)
 */
router.get("/user", (req, res) => {
  GithubController.fetchGHUserController(req, res);
});

/**
 * GET /github/repos
 * Query param: ?userId=xxx
 */
router.get("/repos", (req, res) => {
  GithubController.fetchReposController(req, res);
});

/**
 * POST /github/generate-changelog
 * Request body: { userId, owner, repo, start, end }
 */
router.post("/generate-changelog", (req, res) => {
  GithubController.generateChangelogController(req, res);
});

export default router;
