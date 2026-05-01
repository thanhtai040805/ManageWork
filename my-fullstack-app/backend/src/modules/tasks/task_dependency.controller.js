const TaskDependency = require("./models/task_dependency.model");
const logger = require("../../shared/utils/logger");

const createDependency = async (req, res, next) => {
  try {
    const { taskId, dependsOnTaskId, dependencyType } = req.body;
    
    if (taskId === dependsOnTaskId) {
      return res.status(400).json({ status: "error", message: "A task cannot depend on itself" });
    }

    const isCircular = await TaskDependency.checkCircularDependency(taskId, dependsOnTaskId);
    if (isCircular) {
      return res.status(400).json({ status: "error", message: "Circular dependency detected" });
    }

    const dependency = await TaskDependency.create({ taskId, dependsOnTaskId, dependencyType });
    logger.info(`Dependency created: ${dependency.dependency_id} (Task ${taskId} depends on ${dependsOnTaskId})`);
    
    res.status(201).json({
      status: "success",
      data: dependency
    });
  } catch (error) {
    next(error);
  }
};

const getTaskDependencies = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const dependencies = await TaskDependency.getTaskDependencies(taskId);
    res.status(200).json({
      status: "success",
      data: dependencies
    });
  } catch (error) {
    next(error);
  }
};

const deleteDependency = async (req, res, next) => {
  try {
    const { dependencyId } = req.params;
    await TaskDependency.delete(dependencyId);
    res.status(200).json({
      status: "success",
      message: "Dependency removed successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDependency,
  getTaskDependencies,
  deleteDependency
};
