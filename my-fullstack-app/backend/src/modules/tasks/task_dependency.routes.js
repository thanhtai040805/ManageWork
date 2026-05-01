const express = require("express");
const router = express.Router();
const {
  createDependency,
  getTaskDependencies,
  deleteDependency
} = require("./task_dependency.controller");
const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const {
  createDependencyValidation,
  taskIdParamValidation,
  dependencyIdParamValidation,
} = require("./task_dependency.validation");

router.post("/create", auth, validate(createDependencyValidation), createDependency);
router.get("/task/:taskId", auth, validate(taskIdParamValidation), getTaskDependencies);
router.delete("/:dependencyId", auth, validate(dependencyIdParamValidation), deleteDependency);

module.exports = router;
