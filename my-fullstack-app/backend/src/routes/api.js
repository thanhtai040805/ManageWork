const express = require("express");
const {
  createUser,
  getUsers,
  login,
  getAccount,
  updateProfile,
} = require("../controllers/userController");
const { createTask , getTasks , deleteTaskByID, updateTaskByID, updateTaskStatus} = require("../controllers/taskController");
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
const delay = require("../middlewares/delay");
const auth = require("../middlewares/auth");

const router = express.Router();

// router.use(delay);
router.use(auth);

router.post("/register", (req, res) => {
  createUser(req, res);
});

router.post("/login", (req, res) => {
  login(req, res);
});

router.get("/users", (req, res) => {
  getUsers(req, res);
});

router.get("/account", (req, res) => {
  getAccount(req, res);
});

router.put("/account/profile", (req, res) => {
  updateProfile(req, res);
});

router.post("/createTask", (req, res) => {
  createTask(req, res);
});

router.get("/tasks", (req, res) => {
  getTasks(req, res);
});

router.post("/task/delete/:taskId", (req, res) => {
  deleteTaskByID(req, res);
});

router.post("/task/edit/:taskId", (req, res) => {
  updateTaskByID(req, res);
});

router.patch("/task/status/:taskId", (req, res) => {
  updateTaskStatus(req, res);
});

// Project Routes
router.post("/projects", (req, res) => {
  createProject(req, res);
});

router.get("/projects", (req, res) => {
  getProjects(req, res);
});

router.get("/projects/:projectId", (req, res) => {
  getProject(req, res);
});

router.put("/projects/:projectId", (req, res) => {
  updateProject(req, res);
});

router.delete("/projects/:projectId", (req, res) => {
  deleteProject(req, res);
});

router.get("/projects/:projectId/members", (req, res) => {
  getProjectMembers(req, res);
});

router.post("/projects/:projectId/members", (req, res) => {
  addProjectMember(req, res);
});

router.delete("/projects/:projectId/members/:userId", (req, res) => {
  removeProjectMember(req, res);
});

router.get("/projects/:projectId/stats", (req, res) => {
  getProjectStats(req, res);
});

module.exports = router;
