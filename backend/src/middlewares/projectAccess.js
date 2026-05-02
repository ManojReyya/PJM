import { pool } from "../db/pool.js";

export async function loadProjectMembership(req, res, next) {
  const projectId = Number(req.params.id || req.params.projectId);
  if (!projectId) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const [rows] = await pool.execute(
    `SELECT pm.role_in_project
     FROM project_members pm
     WHERE pm.project_id = ? AND pm.user_id = ?`,
    [projectId, req.user.id]
  );

  if (!rows.length) {
    return res.status(403).json({ message: "Access denied for this project" });
  }

  req.projectId = projectId;
  req.projectRole = rows[0].role_in_project;
  next();
}

export function requireProjectAdmin(req, res, next) {
  if (req.projectRole !== "admin") {
    return res.status(403).json({ message: "Admin role required for this project" });
  }
  next();
}
