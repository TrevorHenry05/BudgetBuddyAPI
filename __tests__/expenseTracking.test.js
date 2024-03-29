const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app"); // Adjust this path to your Express app's entry point
const Expense = require("../models/expense");
const User = require("../models/user");

let token;
let userId;

beforeAll(async () => {
  process.env.NODE_ENV === "test" &&
    require("dotenv").config({ path: ".env.test" });

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.create({
    email: "userexpense@example.com",
    username: "testexpenseuser",
    password: "userpassword",
  });
  const userRes = await request(app).post("/api/auth/login").send({
    email: "userexpense@example.com",
    password: "userpassword",
  });
  token = userRes.body.token;
  userId = user._id;
});

afterAll(async () => {
  await Expense.deleteMany();
  await User.deleteOne({ _id: userId });
  await mongoose.connection.close();
});

describe("Expense Management", () => {
  test("Create a new expense", async () => {
    const newExpenseData = {
      amount: 10000,
      date: new Date(),
      description: `Expense 1`,
      userId: new mongoose.Types.ObjectId(),
      groupId: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    };
    const response = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send(newExpenseData);
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("description", "Expense 1");
    expect(response.body.data).toHaveProperty("amount", 10000);
  });

  test("Find expenses by groupId", async () => {
    const newExpense = await new Expense({
      amount: 10000,
      date: new Date(),
      description: `Expense 1`,
      userId: new mongoose.Types.ObjectId(),
      groupId: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    }).save();
    const response = await request(app)
      .get(`/api/expenses/group/${newExpense.groupId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });

  test("Fetch all expenses", async () => {
    const response = await request(app)
      .get("/api/expenses/user")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test("Fetch specific expense by id", async () => {
    const newExpense = await new Expense({
      amount: 10000,
      date: new Date(),
      description: `Expense 1`,
      userId: new mongoose.Types.ObjectId(),
      groupId: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    }).save();

    //console.log("Expense ID: " + newExpense._id);
    const response = await request(app)
      .get(`/api/expenses/${newExpense._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    //console.log(response);
    expect(response.body).toHaveProperty("_id", newExpense._id.toString());
  });

  test("Update specific expense by expenseId", async () => {
    const newExpense = await new Expense({
      amount: 10000,
      date: new Date(),
      description: `Expense 1`,
      userId: new mongoose.Types.ObjectId(),
      groupId: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    }).save();

    const response = await request(app)
      .put(`/api/expenses/${newExpense._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 500,
        date: new Date(),
        categoryId: new mongoose.Types.ObjectId(),
        description: `Expense Update`,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("description", "Expense Update");
    expect(response.body.data).toHaveProperty("amount", 500);
  });

  test("Delete specific expense by expenseId", async () => {
    const newExpense = await new Expense({
      amount: 10000,
      date: new Date(),
      description: `Expense to delete`,
      userId: new mongoose.Types.ObjectId(),
      groupId: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
    }).save();

    const response = await request(app)
      .delete(`/api/expenses/${newExpense._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Expense deleted successfully"
    );
  });
});
