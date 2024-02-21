const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app"); // Adjust this path to your Express app's entry point
const Budget = require("../models/budget");
const User = require("../models/user");

let token;
let userId;

beforeAll(async () => {
  process.env.NODE_ENV === "test" &&
    require("dotenv").config({ path: ".env.test" });

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const user = new User({
    email: "testbudget@example.com",
    password: "password123",
    username: "testuserbudget",
  });
  await user.save();
  userId = user._id;

  const response = await request(app).post("/api/auth/login").send({
    email: "testbudget@example.com",
    password: "password123",
  });
  token = response.body.token;
});

afterAll(async () => {
  await Budget.deleteMany();
  await User.deleteOne({ _id: userId });
  await mongoose.connection.close();
});

describe("Budget Management", () => {
  test("Should create a new budget", async () => {
    const budgetData = {
      totalBudget: 1000,
      purpose: "Test Budget",
      startDate: new Date(),
      endDate: new Date(),
      budgetType: "personal",
    };
    const response = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${token}`)
      .send(budgetData);
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("purpose", "Test Budget");
  });

  test("Should fetch budgets by user", async () => {
    const response = await request(app)
      .get("/api/budgets/user")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test("Should fetch budgets by groupId", async () => {
    const newBudget = await new Budget({
      totalBudget: 500,
      purpose: "Fetch Test",
      startDate: new Date(),
      endDate: new Date(),
      userId: new mongoose.Types.ObjectId(),
      groupId: new mongoose.Types.ObjectId(),
      budgetType: "personal",
    }).save();
    const response = await request(app)
      .get(`/api/budgets/group/${newBudget.groupId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });

  test("Should fetch a specific budget by budgetId", async () => {
    const newBudget = await new Budget({
      totalBudget: 500,
      purpose: "Fetch Test",
      startDate: new Date(),
      endDate: new Date(),
      userId: new mongoose.Types.ObjectId(),
      budgetType: "personal",
    }).save();

    const response = await request(app)
      .get(`/api/budgets/${newBudget._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", newBudget._id.toString());
  });

  test("Should update a specific budget by budgetId", async () => {
    const budgetToUpdate = await new Budget({
      totalBudget: 1000,
      purpose: "Update Test",
      startDate: new Date(),
      endDate: new Date(),
      groupId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      budgetType: "personal",
    }).save();

    const response = await request(app)
      .put(`/api/budgets/${budgetToUpdate._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        purpose: "Updated Purpose",
        totalBudget: 2000,
        startDate: budgetToUpdate.startDate,
        endDate: new Date(),
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("purpose", "Updated Purpose");
    expect(response.body.data).toHaveProperty("totalBudget", 2000);
  });

  test("Should delete a specific budget by budgetId", async () => {
    // Create a budget to delete
    const budgetToDelete = await new Budget({
      totalBudget: 300,
      purpose: "Delete Test",
      startDate: new Date(),
      endDate: new Date(),
      userId: new mongoose.Types.ObjectId(),
      budgetType: "group",
    }).save();

    const response = await request(app)
      .delete(`/api/budgets/${budgetToDelete._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Budget deleted successfully"
    );
  });

  test("Should fetch all budgets", async () => {
    const response = await request(app)
      .get("/api/budgets")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });
});
