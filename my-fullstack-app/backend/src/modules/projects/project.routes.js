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
} = require("./project.controller");
const auth = require("../../shared/middlewares/auth");

router.post("/", auth, createProject);
router.get("/", auth, getProjects);
router.get("/:projectId", auth, getProject);
router.put("/:projectId", auth, updateProject);
router.delete("/:projectId", auth, deleteProject);

// Members & Stats
router.get("/:projectId/members", auth, getProjectMembers);
router.post("/:projectId/members", auth, addProjectMember);
router.delete("/:projectId/members/:userId", auth, removeProjectMember);
router.get("/:projectId/stats", auth, getProjectStats);

module.exports = router;
