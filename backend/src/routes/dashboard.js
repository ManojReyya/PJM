import express from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) AS todo,
         SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS done,
         SUM(CASE WHEN t.due_date < NOW() AND t.status != 'done' THEN 1 ELSE 0 END) AS overdue
       FROM tasks t
       JOIN project_members pm ON pm.project_id = t.project_id
       WHERE pm.user_id = ?`,
      [req.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/my-tasks", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.*
       FROM tasks t
       WHERE t.assigned_to = ?
       ORDER BY t.due_date IS NULL, t.due_date ASC, t.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/overdue", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.*
       FROM tasks t
       JOIN project_members pm ON pm.project_id = t.project_id
       WHERE pm.user_id = ?
         AND t.status != 'done'
         AND t.due_date < NOW()
       ORDER BY t.due_date ASC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
