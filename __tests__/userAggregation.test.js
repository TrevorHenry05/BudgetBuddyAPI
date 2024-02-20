const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const axios = require("axios");

const Expense = require("../models/expense");
const Budget = require("../models/budget");
const User = require("../models/user");

let token;
let userId;
let user;
let budget;
let expense;
let serverRunning = true;

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const response = await axios.post("http://localhost:3000/api/auth/login", {
      email: "nonexistentuser@example.com",
      password: "wrongpassword",
    });

    if (response.status === 200) {
      console.log("Unexpected success response from the server.");
      serverRunning = false;
    } else if (response.status === 400) {
      console.log("Server is up. Proceeding with tests.");
    } else {
      console.log("Server not responding as expected:", response.statusText);
      serverRunning = false;
    }

    if (!serverRunning) return; // Skip further setup if server is not running

    // Create and authenticate a user
    user = new User({
      email: "testaggregate@example.com",
      password: "password123",
      username: "testaggregationuser",
    });
    await user.save();
    userId = user._id;
    const result = await request(app).post("/api/auth/login").send({
      email: "testaggregate@example.com",
      password: "password123",
    });
    token = result.body.token;
  } catch (error) {
    console.log("DB connection failed or unexpected error:", error.message);
    serverRunning = false;
  }
});

afterAll(async () => {
  if (!serverRunning) return;

  await User.findByIdAndDelete(userId);
  if (budget) await Budget.findByIdAndDelete(budget._id);
  if (expense) await Expense.findByIdAndDelete(expense._id);
  await mongoose.connection.close();
});

describe("User Data Aggregation Service", () => {
  test("Should aggregate user expenses and budgets", async () => {
    if (!serverRunning) {
      console.log("Test skipped because the server is not running.");
      await mongoose.connection.close();
      return;
    }
    // Create test data for expenses and budgets
    budget = await new Budget({
      totalBudget: 1000,
      purpose: "Test Budget",
      startDate: new Date(),
      endDate: new Date(),
      userId,
      budgetType: "personal",
    }).save();

    expense = await new Expense({
      amount: 100,
      date: new Date(),
      description: "Test Expense",
      budgetId: budget._id,
      userId,
    }).save();

    // Test the aggregation endpoint
    const response = await request(app)
      .get("/api/aggregation/user")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.aggregatedData).toBeDefined();
    expect(
      response.body.aggregatedData.some((budget) => budget.expenses.length > 0)
    ).toBeTruthy();
  });
});
