import express from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middlewares/auth.js";
import { loadProjectMembership, requireProjectAdmin } from "../middlewares/projectAccess.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const [result] = await pool.execute(
      "INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)",
      [name, description || null, req.user.id]
    );

    await pool.execute(
      "INSERT INTO project_members (project_id, user_id, role_in_project) VALUES (?, ?, 'admin')",
      [result.insertId, req.user.id]
    );

    res.status(201).json({ id: result.insertId, name, description: description || null });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.id, p.name, p.description, p.owner_id, p.created_at, pm.role_in_project
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", loadProjectMembership, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM projects WHERE id = ?", [req.projectId]);
    if (!rows.length) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ ...rows[0], role_in_project: req.projectRole });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", loadProjectMembership, requireProjectAdmin, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    await pool.execute("UPDATE projects SET name = ?, description = ? WHERE id = ?", [
      name,
      description || null,
      req.projectId
    ]);

    res.json({ message: "Project updated" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", loadProjectMembership, requireProjectAdmin, async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM projects WHERE id = ?", [req.projectId]);
    res.json({ message: "Project deleted" });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/members", loadProjectMembership, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, pm.role_in_project, pm.joined_at
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ?
       ORDER BY pm.joined_at ASC`,
      [req.projectId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/members", loadProjectMembership, requireProjectAdmin, async (req, res, next) => {
  try {
    const { email, role_in_project } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Member email is required" });
    }

    const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const memberRole = role_in_project === "admin" ? "admin" : "member";

    await pool.execute(
      `INSERT INTO project_members (project_id, user_id, role_in_project)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE role_in_project = VALUES(role_in_project)`,
      [req.projectId, users[0].id, memberRole]
    );

    res.status(201).json({ message: "Member added/updated" });
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:id/members/:userId",
  loadProjectMembership,
  requireProjectAdmin,
  async (req, res, next) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      await pool.execute("DELETE FROM project_members WHERE project_id = ? AND user_id = ?", [
        req.projectId,
        userId
      ]);

      res.json({ message: "Member removed" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
