
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Convert a PostgreSQL row to the API's task format.
function formatTask(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    priority: row.priority,
    completed: row.completed,
    created_at: row.created_at,
  };
}

// GET /api/tasks
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, priority, completed, created_at FROM tasks ORDER BY id ASC"
    );

    const tasks = result.rows.map(formatTask);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/tasks
router.post("/", async (req, res, next) => {
  const { title, category = "General", priority = "Medium" } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Task title is required.",
    });
  }

  if (title.trim().length > 160) {
    return res.status(400).json({
      success: false,
      message: "Task title must not exceed 160 characters.",
    });
  }

  if (
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 50
  ) {
    return res.status(400).json({
      success: false,
      message: "Category must be a non-empty string of at most 50 characters.",
    });
  }

  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be Low, Medium, or High.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, category, priority)
       VALUES ($1, $2, $3)
       RETURNING id, title, category, priority, completed, created_at`,
      [title.trim(), category.trim(), priority]
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: formatTask(result.rows[0]),
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Task ID must be a positive integer.",
    });
  }

  const { title, category, priority, completed } = req.body;

  if (title !== undefined) {
    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 160
    ) {
      return res.status(400).json({
        success: false,
        message: "Title must contain 1 to 160 characters.",
      });
    }
  }

  if (category !== undefined) {
    if (
      typeof category !== "string" ||
      !category.trim() ||
      category.trim().length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Category must contain 1 to 50 characters.",
      });
    }
  }

  if (priority !== undefined && !["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Priority must be Low, Medium, or High.",
    });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Completed must be true or false.",
    });
  }

  const updates = [];
  const values = [];

  function addUpdate(column, value) {
    values.push(value);
    updates.push(`${column} = $${values.length}`);
  }

  if (title !== undefined) addUpdate("title", title.trim());
  if (category !== undefined) addUpdate("category", category.trim());
  if (priority !== undefined) addUpdate("priority", priority);
  if (completed !== undefined) addUpdate("completed", completed);

  if (updates.length === 0) {
    try {
      const result = await pool.query(
        `SELECT id, title, category, priority, completed, created_at
         FROM tasks WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Task not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Task updated successfully.",
        data: formatTask(result.rows[0]),
      });
    } catch (error) {
      return next(error);
    }
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET ${updates.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, title, category, priority, completed, created_at`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: formatTask(result.rows[0]),
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Task ID must be a positive integer.",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING id, title, category, priority, completed, created_at`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      data: formatTask(result.rows[0]),
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
