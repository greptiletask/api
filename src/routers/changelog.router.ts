import { Router } from "express";
import { ChangelogController } from "../controllers/changelog.controller";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.post("/", verifyToken, (req, res) => {
  ChangelogController.createChangelogController(req, res);
});
router.get("/:projectSlug", (req, res) => {
  ChangelogController.getChangelogsController(req, res);
});
router.get("/projects", verifyToken, (req, res) => {
  ChangelogController.getProjectsController(req, res);
});
router.get("/projects/:projectSlug", verifyToken, (req, res) => {
  ChangelogController.getProjectController(req, res);
});

export default router;
