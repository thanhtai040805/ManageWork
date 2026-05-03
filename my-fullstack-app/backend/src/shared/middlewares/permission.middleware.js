const pool = require("../config/database");

const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin', 
  MEMBER: 'member',
  VIEWER: 'viewer'
};

const PERMISSIONS = {
  // Project permissions
  PROJECT_CREATE: ['owner', 'admin'],
  PROJECT_EDIT: ['owner', 'admin', 'member'],
  PROJECT_VIEW: ['owner', 'admin', 'member', 'viewer'],
  PROJECT_DELETE: ['owner'],
  PROJECT_MANAGE_MEMBERS: ['owner', 'admin'],
  
  // Task permissions
  TASK_CREATE: ['owner', 'admin', 'member'],
  TASK_EDIT: ['owner', 'admin', 'member'],
  TASK_VIEW: ['owner', 'admin', 'member', 'viewer'],
  TASK_DELETE: ['owner', 'admin'],
  TASK_ASSIGN: ['owner', 'admin', 'member'],
  
  // User permissions
  USER_INVITE: ['owner', 'admin'],
  USER_MANAGE: ['owner', 'admin'],
  
  // Analytics
  ANALYTICS_VIEW_ADMIN: ['owner', 'admin'],
  ANALYTICS_VIEW_PERSONAL: ['owner', 'admin', 'member', 'viewer']
};

const checkPermission = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userRole = req.user?.role || 'member';
      
      if (requiredRoles.includes(userRole)) {
        return next();
      }

      if (req.params.projectId) {
        const projectMember = await pool.query(
          `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
          [req.params.projectId, userId]
        );
        
        if (projectMember.rows.length > 0) {
          const projectRole = projectMember.rows[0].role;
          if (requiredRoles.includes(projectRole)) {
            return next();
          }
        }
      }

      return res.status(403).json({ error: "Insufficient permissions" });
    } catch (error) {
      next(error);
    }
  };
};

const checkProjectRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.user?.uid;
      
      if (!projectId) {
        return res.status(400).json({ error: "Project ID required" });
      }

      const result = await pool.query(
        `SELECT pm.role, p.owner_id FROM project_members pm
         JOIN projects p ON pm.project_id = p.project_id
         WHERE pm.project_id = $1 AND pm.user_id = $2`,
        [projectId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: "Not a project member" });
      }

      const { role, owner_id } = result.rows[0];
      const effectiveRole = owner_id === userId ? 'owner' : role;

      if (!allowedRoles.includes(effectiveRole)) {
        return res.status(403).json({ error: "Insufficient project permissions" });
      }

      req.projectRole = effectiveRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'member';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Role not allowed" });
    }
    next();
  };
};

module.exports = {
  ROLES,
  PERMISSIONS,
  checkPermission,
  checkProjectRole,
  requireRole
};