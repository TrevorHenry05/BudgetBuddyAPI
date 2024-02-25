const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user");

let token;

beforeAll(async () => {
  process.env.NODE_ENV === "test" &&
    require("dotenv").config({ path: ".env.test" });

  // Connect to the test database
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Authentication Service", () => {
  test("POST /register - should register a new user and return a token", async () => {
    const userData = {
      username: "testUserauth",
      email: "testauth@example.com",
      password: "password123",
    };
    const response = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");
  });

  test("POST /login - should login the user and return a token", async () => {
    const userData = { email: "testauth@example.com", password: "password123" };
    await request(app).post("/api/auth/register").send(userData);
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password });
    token = response.body.token;
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("POST /login - should return an error for invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@example.com", password: "wrongPassword" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toEqual("Invalid credentials");
  });

  test("DELETE /profile should delete the authenticated user's account", async () => {
    const response = await request(app)
      .delete("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "User deleted successfully"
    );
  });
});
