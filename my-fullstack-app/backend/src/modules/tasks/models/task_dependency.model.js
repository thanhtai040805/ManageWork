const pool = require("../../../shared/config/database");

class TaskDependency {
  static async create(dependencyData) {
    const { taskId, dependsOnTaskId, dependencyType = "blocking" } = dependencyData;
    const query = `
      INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [taskId, dependsOnTaskId, dependencyType]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating task dependency:", error);
      throw error;
    }
  }

  static async getTaskDependencies(taskId) {
    const query = `
      SELECT td.*, t.title as depends_on_title, t.status as depends_on_status
      FROM task_dependencies td
      JOIN tasks t ON td.depends_on_task_id = t.task_id
      WHERE td.task_id = $1
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting task dependencies:", error);
      throw error;
    }
  }

  static async getTasksBlockingThis(taskId) {
    const query = `
      SELECT td.*, t.title as task_title, t.status as task_status
      FROM task_dependencies td
      JOIN tasks t ON td.task_id = t.task_id
      WHERE td.depends_on_task_id = $1
    `;
    
    try {
      const result = await pool.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      console.error("Error getting tasks blocking this:", error);
      throw error;
    }
  }

  static async delete(dependencyId) {
    const query = `DELETE FROM task_dependencies WHERE dependency_id = $1`;
    
    try {
      await pool.query(query, [dependencyId]);
      return true;
    } catch (error) {
      console.error("Error deleting task dependency:", error);
      throw error;
    }
  }

  static async checkCircularDependency(taskId, dependsOnTaskId) {
    // Basic BFS/DFS to check if taskId is already a dependency of dependsOnTaskId
    const visited = new Set();
    const queue = [dependsOnTaskId];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === taskId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const deps = await this.getTaskDependencies(current);
      for (const dep of deps) {
        queue.push(dep.depends_on_task_id);
      }
    }
    return false;
  }
}

module.exports = TaskDependency;
