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
const validate = require("../../shared/middlewares/validation.middleware");
const {
  createProjectValidation,
  updateProjectValidation,
  projectIdParamValidation,
  addMemberValidation,
} = require("./project.validation");

router.post("/", auth, validate(createProjectValidation), createProject);
router.get("/", auth, getProjects);
router.get("/:projectId", auth, validate(projectIdParamValidation), getProject);
router.put("/:projectId", auth, validate(updateProjectValidation), updateProject);
router.delete("/:projectId", auth, validate(projectIdParamValidation), deleteProject);

// Members & Stats
router.get("/:projectId/members", auth, validate(projectIdParamValidation), getProjectMembers);
router.post("/:projectId/members", auth, validate(addMemberValidation), addProjectMember);
router.delete("/:projectId/members/:userId", auth, validate(projectIdParamValidation), removeProjectMember);
router.get("/:projectId/stats", auth, validate(projectIdParamValidation), getProjectStats);

module.exports = router;
