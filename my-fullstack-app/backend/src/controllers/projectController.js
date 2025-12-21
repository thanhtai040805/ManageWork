const projectModel = require("../models/project");
const taskModel = require("../models/task");

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.uid;

    if (!name) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await projectModel.create({
      name,
      description,
      ownerId,
    });

    // Add owner as admin member
    await projectModel.addMember(project.project_id, ownerId, "admin");

    return res.status(201).json({
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      message: "Error creating project",
      error: error.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user.uid;
    const projects = await projectModel.getUserProjects(userId);
    return res.status(200).json(projects);
  } catch (error) {
    console.error("Error getting projects:", error);
    return res.status(500).json({
      message: "Error getting projects",
      error: error.message,
    });
  }
};

const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await projectModel.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Get project members
    const members = await projectModel.getProjectMembers(projectId);
    
    // Get project stats
    const stats = await projectModel.getProjectStats(projectId);
    
    // Get project tasks
    const tasks = await taskModel.getProjectTasks(projectId);

    return res.status(200).json({
      ...project,
      members,
      stats,
      tasks,
    });
  } catch (error) {
    console.error("Error getting project:", error);
    return res.status(500).json({
      message: "Error getting project",
      error: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.uid;

    // Check if user is owner or admin
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner_id !== userId) {
      // Check if user is admin member
      const members = await projectModel.getProjectMembers(projectId);
      const userMember = members.find(m => m.user_id === userId);
      if (!userMember || userMember.role !== "admin") {
        return res.status(403).json({
          message: "You don't have permission to update this project",
        });
      }
    }

    const updatedProject = await projectModel.update(projectId, {
      name,
      description,
    });

    return res.status(200).json({
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      message: "Error updating project",
      error: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.uid;

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner_id !== userId) {
      return res.status(403).json({
        message: "Only project owner can delete the project",
      });
    }

    await projectModel.delete(projectId);
    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      message: "Error deleting project",
      error: error.message,
    });
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const members = await projectModel.getProjectMembers(projectId);
    return res.status(200).json(members);
  } catch (error) {
    console.error("Error getting project members:", error);
    return res.status(500).json({
      message: "Error getting project members",
      error: error.message,
    });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, role } = req.body;
    const userId = req.user.uid;

    // Check permissions
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner_id !== userId) {
      const members = await projectModel.getProjectMembers(projectId);
      const userMember = members.find(m => m.user_id === userId);
      if (!userMember || (userMember.role !== "admin" && userMember.role !== "member")) {
        return res.status(403).json({
          message: "You don't have permission to add members",
        });
      }
    }

    const member = await projectModel.addMember(projectId, user_id, role || "viewer");
    return res.status(201).json({
      message: "Member added successfully",
      data: member,
    });
  } catch (error) {
    console.error("Error adding project member:", error);
    return res.status(500).json({
      message: "Error adding project member",
      error: error.message,
    });
  }
};

const removeProjectMember = async (req, res) => {
  try {
    const { projectId, userId: memberUserId } = req.params;
    const userId = req.user.uid;

    // Check permissions
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner_id !== userId && memberUserId !== userId) {
      const members = await projectModel.getProjectMembers(projectId);
      const userMember = members.find(m => m.user_id === userId);
      if (!userMember || userMember.role !== "admin") {
        return res.status(403).json({
          message: "You don't have permission to remove members",
        });
      }
    }

    await projectModel.removeMember(projectId, memberUserId);
    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing project member:", error);
    return res.status(500).json({
      message: "Error removing project member",
      error: error.message,
    });
  }
};

const getProjectStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const stats = await projectModel.getProjectStats(projectId);
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting project stats:", error);
    return res.status(500).json({
      message: "Error getting project stats",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  getProjectStats,
};

