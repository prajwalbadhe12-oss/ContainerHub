
const request = require("supertest");
const app = require("../server");
const pool = require("../db");

describe("ContainerHub API Tests", () => {
  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/health should return healthy status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("healthy");
    expect(response.body.application).toBe("ContainerHub");
  });

  test("GET /api/version should return application version", async () => {
    const response = await request(app).get("/api/version");

    expect(response.statusCode).toBe(200);
    expect(response.body.version).toBe("1.0.0");
  });

  test("GET /api/tasks should return a list of tasks", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.count).toBe(response.body.data.length);
  });

  test("POST /api/tasks should create a task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Automated test task",
        category: "Testing",
        priority: "High",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Automated test task");
    expect(response.body.data.category).toBe("Testing");
    expect(response.body.data.priority).toBe("High");
  });

  test("POST /api/tasks should reject an empty title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "" });

    expect(response.statusCode).toBe(400);
  });
});
