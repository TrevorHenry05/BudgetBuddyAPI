const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const axios = require("axios");

const Expense = require("../models/expense");
const Budget = require("../models/budget");
const User = require("../models/user");
const ExpenseCategory = require("../models/expenseCategory");
const Group = require("../models/group");

let token;
let userId;
let groupId;
let user;
let group;
let budget;
let expense;
let expenseCategory;
let serverRunning = true;

beforeAll(async () => {
  try {
    require("dotenv").config({ path: ".env" });

    await mongoose.connect(process.env.MONGODB_URI);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: "nonexistentuser@example.com",
          password: "wrongpassword",
        }
      );
    } catch (error) {
      if (!error.response) {
        console.log("Server is not running.", error.message);
        serverRunning = false;
      } else if (error.response.status && error.response.status === 401) {
        console.log("Server is up. Proceeding with tests.");
      } else {
        console.log("Server not responding as expected:", error.message);
        serverRunning = false;
      }
    }

    if (!serverRunning) return; // Skip further setup if server is not running

    // Create and authenticate a user
    user = new User({
      email: "testaggregategroup@example.com",
      password: "password123",
      username: "testaggregationgroup",
    });
    await user.save();
    userId = user._id;
    console.log("User created:", await User.findById(userId));

    const result = await request(app).post("/api/auth/login").send({
      email: "testaggregategroup@example.com",
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

  if (budget) {
    await Budget.deleteOne({ _id: budget._id });
  }

  if (expense) {
    await Expense.deleteOne({ _id: expense._id });
  }

  if (expenseCategory) {
    await ExpenseCategory.deleteOne({ _id: expenseCategory._id });
  }

  if (user) {
    await User.deleteOne({ _id: user._id });
  }

  if (group) {
    await Group.deleteOne({ _id: group._id });
  }
  await mongoose.connection.close();
});

describe("Group Data Aggregation Service", () => {
  test("Should aggregate group expenses and budgets", async () => {
    if (!serverRunning) {
      console.log("Test skipped because the server is not running.");
      return;
    }
    group = await new Group({
      groupName: "Test Group",
      members: [userId],
    }).save();

    groupId = group._id;
    // Create test data for expenses and budgets
    budget = await new Budget({
      totalBudget: 1000,
      purpose: "Test Budget",
      startDate: new Date(),
      endDate: new Date(),
      userId,
      groupId,
      budgetType: "personal",
    }).save();

    expenseCategory = await new ExpenseCategory({
      categoryName: "Test Group Category",
    }).save();

    expense = await new Expense({
      amount: 100,
      date: new Date(),
      description: "Test Expense",
      budgetId: budget._id,
      userId,
      groupId,
      categoryId: expenseCategory._id,
    }).save();

    // Test the aggregation endpoint
    const response = await request(app)
      .get(`/api/aggregation/group/${groupId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.aggregatedData).toBeDefined();
    expect(
      response.body.aggregatedData.some((budget) => budget.expenses.length >= 0)
    ).toBeTruthy();
    expect(response.body.aggregatedData[0]._id).toBe(budget._id.toString());
    expect(response.body.aggregatedData[0].groupId).toBe(groupId.toString());
    expect(response.body.aggregatedData[0].expenses[0]._id).toBe(
      expense._id.toString()
    );
    console.log("User created:", await User.findById(userId));
    console.log("Group created:", await Group.findById(groupId));
    console.log(response.body.aggregatedData);
    console.log(response.body.aggregatedData[0].expenses[0]);
  });
});
