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
const auth = require("../middlewares/auth");

const router = express.Router();

// router.use(delay);

// Public routes (no auth required)
/**
 * @openapi
 * /register:
 *   post:
 *     tags: [Auth]
 *     summary: Register
 *     security: []
 */
router.post("/register", (req, res) => {
  createUser(req, res);
});

/**
 * @openapi
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     security: []
 */
router.post("/login", (req, res) => {
  login(req, res);
});

// Private routes (auth required)
router.use(auth);

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get users
 */
router.get("/users", (req, res) => {
  getUsers(req, res);
});

/**
 * @openapi
 * /account:
 *   get:
 *     tags: [Users]
 *     summary: Get my account
 */
router.get("/account", (req, res) => {
  getAccount(req, res);
});

/**
 * @openapi
 * /account/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update profile
 */
router.put("/account/profile", (req, res) => {
  updateProfile(req, res);
});

/**
 * @openapi
 * /createTask:
 *   post:
 *     tags: [Tasks]
 *     summary: Create task
 */
router.post("/createTask", (req, res) => {
  createTask(req, res);
});

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get tasks
 */
router.get("/tasks", (req, res) => {
  getTasks(req, res);
});

/**
 * @openapi
 * /task/delete/{taskId}:
 *   post:
 *     tags: [Tasks]
 *     summary: Delete task
 */
router.post("/task/delete/:taskId", (req, res) => {
  deleteTaskByID(req, res);
});

/**
 * @openapi
 * /task/edit/{taskId}:
 *   post:
 *     tags: [Tasks]
 *     summary: Update task
 */
router.post("/task/edit/:taskId", (req, res) => {
  updateTaskByID(req, res);
});

/**
 * @openapi
 * /task/status/{taskId}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task status
 */
router.patch("/task/status/:taskId", (req, res) => {
  updateTaskStatus(req, res);
});

/**
 * @openapi
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create project
 */
router.post("/projects", (req, res) => {
  createProject(req, res);
});

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get projects
 */
router.get("/projects", (req, res) => {
  getProjects(req, res);
});

/**
 * @openapi
 * /projects/{projectId}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project detail
 */
router.get("/projects/:projectId", (req, res) => {
  getProject(req, res);
});

/**
 * @openapi
 * /projects/{projectId}:
 *   put:
 *     tags: [Projects]
 *     summary: Update project
 */
router.put("/projects/:projectId", (req, res) => {
  updateProject(req, res);
});

/**
 * @openapi
 * /projects/{projectId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project
 */
router.delete("/projects/:projectId", (req, res) => {
  deleteProject(req, res);
});

/**
 * @openapi
 * /projects/{projectId}/members:
 *   get:
 *     tags: [Projects]
 *     summary: Get project members
 */
router.get("/projects/:projectId/members", (req, res) => {
  getProjectMembers(req, res);
});

/**
 * @openapi
 * /projects/{projectId}/members:
 *   post:
 *     tags: [Projects]
 *     summary: Add project member
 */
router.post("/projects/:projectId/members", (req, res) => {
  addProjectMember(req, res);
});

/**
 * @openapi
 * /projects/{projectId}/members/{userId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Remove project member
 */
router.delete("/projects/:projectId/members/:userId", (req, res) => {
  removeProjectMember(req, res);
});

/**
 * @openapi
 * /projects/{projectId}/stats:
 *   get:
 *     tags: [Projects]
 *     summary: Get project stats
 */
router.get("/projects/:projectId/stats", (req, res) => {
  getProjectStats(req, res);
});

module.exports = router;
