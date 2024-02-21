const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app"); // Update the path to your Express app's entry point
const Group = require("../models/group");
const User = require("../models/user");

let token;
let userId;

beforeAll(async () => {
  process.env.NODE_ENV === "test" &&
    require("dotenv").config({ path: ".env.test" });

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.create({
    email: "usergroup@example.com",
    username: "testgroupuser",
    password: "userpassword",
  });
  const userRes = await request(app).post("/api/auth/login").send({
    email: "usergroup@example.com",
    password: "userpassword",
  });
  token = userRes.body.token;
  userId = user._id;
});

afterAll(async () => {
  await Group.deleteMany();
  await User.deleteOne({ _id: userId });
  await mongoose.connection.close();
});

describe("Group Collaboration Service", () => {
  let groupId;

  test("POST / - Create a new group", async () => {
    const response = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({
        groupName: "Test Group",
      });
    expect(response.statusCode).toBe(201);
    groupId = response.body.data._id;
  });

  test("GET /user - Fetch all groups for the authenticated user", async () => {
    const response = await request(app)
      .get("/api/groups/user")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("GET /:groupId - Fetch a single group by its ID", async () => {
    const response = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", groupId);
  });

  test("PUT /:groupId - Update a group by its ID", async () => {
    const response = await request(app)
      .put(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        groupName: "Updated Test Group",
        members: [userId],
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty(
      "groupName",
      "Updated Test Group"
    );
  });

  test("POST /:groupId/members - Add a new member to a group", async () => {
    const response = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        memberId: userId,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.members).toContainEqual(expect.any(String));
  });

  test("DELETE /:groupId/members/:memberId - Remove a member from a group", async () => {
    const response = await request(app)
      .delete(`/api/groups/${groupId}/members/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });

  test("GET / - Fetch all groups", async () => {
    const response = await request(app)
      .get("/api/groups")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });
});
