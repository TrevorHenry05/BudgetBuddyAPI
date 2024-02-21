const request = require("supertest");
const app = require("../app"); // Adjust this path to your Express app's entry point
const mongoose = require("mongoose");
const User = require("../models/user");

let token;
let user;

beforeAll(async () => {
  // Set up environment and database connection
  process.env.NODE_ENV === "test" &&
    require("dotenv").config({ path: ".env.test" });

  // Connect to the test database
  await mongoose.connect(process.env.MONGODB_URI);

  // Create a test user and log in to get a token
  user = await User.create({
    email: "test@example.com",
    username: "testusermanagement",
    password: "password",
  });
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "password" });
  token = response.body.token;
});

afterAll(async () => {
  // Clean up: remove test user and close DB connection
  await User.deleteOne({ _id: user._id });
  await mongoose.connection.close();
});

describe("User Management Endpoints", () => {
  test("GET /profile should fetch the authenticated user's profile", async () => {
    const response = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("email", "test@example.com");
    expect(response.body).not.toHaveProperty("password");
  });

  test("GET /all should fetch all users without passwords", async () => {
    const response = await request(app)
      .get("/api/users/all")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach((user) => {
      expect(user).not.toHaveProperty("password");
    });
  });

  test("PUT /profile should update the authenticated user's profile", async () => {
    const updates = { username: "updatedTestUser" };
    const response = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send(updates);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("username", updates.username);
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
