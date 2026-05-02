import express from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middlewares/auth.js";
import { loadProjectMembership, requireProjectAdmin } from "../middlewares/projectAccess.js";

const router = express.Router();

router.use(requireAuth);

router.post("/projects/:id/tasks", loadProjectMembership, async (req, res, next) => {
  try {
    const { title, description, priority, assigned_to, due_date } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO tasks (project_id, title, description, priority, assigned_to, created_by, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.projectId,
        title,
        description || null,
        ["low", "medium", "high"].includes(priority) ? priority : "medium",
        assigned_to || null,
        req.user.id,
        due_date || null
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.get("/projects/:id/tasks", loadProjectMembership, async (req, res, next) => {
  try {
    const { status, assignedTo, overdue } = req.query;
    const clauses = ["t.project_id = ?"];
    const values = [req.projectId];

    if (status && ["todo", "in_progress", "done"].includes(status)) {
      clauses.push("t.status = ?");
      values.push(status);
    }

    if (assignedTo) {
      clauses.push("t.assigned_to = ?");
      values.push(Number(assignedTo));
    }

    if (overdue === "true") {
      clauses.push("t.due_date < NOW() AND t.status != 'done'");
    }

    const [rows] = await pool.execute(
      `SELECT t.*, u.name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE ${clauses.join(" AND ")}
       ORDER BY t.created_at DESC`,
      values
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/tasks/:taskId", async (req, res, next) => {
  try {
    const taskId = Number(req.params.taskId);
    if (!taskId) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const [rows] = await pool.execute(
      `SELECT t.*, pm.role_in_project
       FROM tasks t
       JOIN project_members pm ON pm.project_id = t.project_id
       WHERE t.id = ? AND pm.user_id = ?`,
      [taskId, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/tasks/:taskId", async (req, res, next) => {
  try {
    const taskId = Number(req.params.taskId);
    if (!taskId) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const [taskRows] = await pool.execute("SELECT project_id FROM tasks WHERE id = ?", [taskId]);
    if (!taskRows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    const projectId = taskRows[0].project_id;
    const [memberRows] = await pool.execute(
      "SELECT role_in_project FROM project_members WHERE project_id = ? AND user_id = ?",
      [projectId, req.user.id]
    );

    if (!memberRows.length || memberRows[0].role_in_project !== "admin") {
      return res.status(403).json({ message: "Project admin required" });
    }

    const { title, description, status, priority, assigned_to, due_date } = req.body;

    await pool.execute(
      `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?
       WHERE id = ?`,
      [
        title,
        description || null,
        ["todo", "in_progress", "done"].includes(status) ? status : "todo",
        ["low", "medium", "high"].includes(priority) ? priority : "medium",
        assigned_to || null,
        due_date || null,
        taskId
      ]
    );

    res.json({ message: "Task updated" });
  } catch (err) {
    next(err);
  }
});

router.patch("/tasks/:taskId/status", async (req, res, next) => {
  try {
    const taskId = Number(req.params.taskId);
    const { status } = req.body;
    if (!taskId || !["todo", "in_progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid task or status" });
    }

    const [rows] = await pool.execute(
      `SELECT t.assigned_to, t.project_id, pm.role_in_project
       FROM tasks t
       JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = ?
       WHERE t.id = ?`,
      [req.user.id, taskId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    const row = rows[0];
    const canUpdate = row.role_in_project === "admin" || row.assigned_to === req.user.id;
    if (!canUpdate) {
      return res.status(403).json({ message: "Not allowed to update this task status" });
    }

    await pool.execute("UPDATE tasks SET status = ? WHERE id = ?", [status, taskId]);
    res.json({ message: "Status updated" });
  } catch (err) {
    next(err);
  }
});

router.delete("/tasks/:taskId", async (req, res, next) => {
  try {
    const taskId = Number(req.params.taskId);
    if (!taskId) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const [rows] = await pool.execute(
      `SELECT pm.role_in_project
       FROM tasks t
       JOIN project_members pm ON pm.project_id = t.project_id
       WHERE t.id = ? AND pm.user_id = ?`,
      [taskId, req.user.id]
    );

    if (!rows.length || rows[0].role_in_project !== "admin") {
      return res.status(403).json({ message: "Project admin required" });
    }

    await pool.execute("DELETE FROM tasks WHERE id = ?", [taskId]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
