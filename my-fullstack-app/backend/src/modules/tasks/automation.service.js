const Task = require("./task.model");
const Subtask = require("./models/subtask.model");
const Project = require("../projects/project.model");

class AutomationService {
  /**
   * Rule: IF all subtasks are done -> SET task status to 'done'
   * Rule: IF a subtask is re-opened -> SET task status to 'in_progress' (if it was 'done')
   */
  static async cascadeTaskStatus(taskId) {
    try {
      const stats = await Subtask.getTaskSubtaskStats(taskId);
      const task = await Task.findById(taskId);

      if (!task) return;

      // Only automate if there are actually subtasks
      if (parseInt(stats.total_subtasks) > 0) {
        // If all subtasks are done and task is not yet done
        if (parseInt(stats.pending_subtasks) === 0) {
          if (task.status !== 'done') {
            await Task.updateStatus(taskId, 'done');
            return { action: 'updated_to_done', taskId };
          }
        } 
        // If there are pending subtasks but task is marked as done
        else if (parseInt(stats.pending_subtasks) > 0 && task.status === 'done') {
          await Task.updateStatus(taskId, 'in_progress');
          return { action: 'updated_to_in_progress', taskId };
        }
      }
    } catch (error) {
      console.error("Error in cascadeTaskStatus automation:", error);
    }
  }

  /**
   * Rule: IF task created without assignee -> SET to project owner
   */
  static async autoAssignTask(taskData) {
    // If already has assignee, don't override
    if (taskData.assignedTo) return taskData.assignedTo;
    
    // If has project, assign to project owner
    if (taskData.projectId) {
      try {
        const project = await Project.findById(taskData.projectId);
        if (project && project.owner_id) {
          return project.owner_id;
        }
      } catch (error) {
        console.error("Error in autoAssignTask automation:", error);
      }
    }
    
    // Fallback to creator
    return taskData.createdBy;
  }
}

module.exports = AutomationService;
