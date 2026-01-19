const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  getProjectStats,
} = require("../controllers/projectController");

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectId", getProject);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

// Members & Stats
router.get("/:projectId/members", getProjectMembers);
router.post("/:projectId/members", addProjectMember);
router.delete("/:projectId/members/:userId", removeProjectMember);
router.get("/:projectId/stats", getProjectStats);

module.exports = router;
