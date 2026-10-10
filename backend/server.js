
const express = require("express");
const taskRoutes = require("./routes/taskRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());

// Task management API
app.use("/api/tasks", taskRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    application: "ContainerHub",
  });
});

// Version information
app.get("/api/version", (req, res) => {
  res.status(200).json({
    version: "1.0.0",
  });
});

// Welcome endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to ContainerHub",
    application: "ContainerHub",
    version: "1.0.0",
    status: "running",
  });
});

// JSON error handler for malformed request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  return next(err);
});

// Graceful shutdown
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ContainerHub server running on port ${PORT}`);
  });
}

module.exports = app;

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down server.");

  server.close(() => {
    console.log("ContainerHub server stopped.");
    process.exit(0);
  });
});
