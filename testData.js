const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");

const User = require("./models/user");
const Group = require("./models/group");
const ExpenseCategory = require("./models/expenseCategory");
const Expense = require("./models/expense");
const Budget = require("./models/budget");

require("dotenv").config();

const getRandomSubset = (array, subsetSize) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, subsetSize);
};

mongoose
  .connect("mongodb://localhost:27017/budgetbuddy")
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.error(err));

async function loadJSONData(filename) {
  const filePath = path.join(__dirname, "testData", filename);
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

async function insertUsers() {
  const usersData = await loadJSONData("users.json");
  for (const userData of usersData) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  return User.insertMany(usersData);
}

async function insertGroups(users) {
  const groupsData = await loadJSONData("groups.json");
  const modifiedGroupsData = groupsData.map((group) => ({
    ...group,
    members: getRandomSubset(users, 3).map((user) => user._id),
  }));
  return Group.insertMany(modifiedGroupsData);
}

async function insertExpenseCategories() {
  const categoriesData = await loadJSONData("expenseCategories.json");
  return ExpenseCategory.insertMany(categoriesData);
}

async function createExpensesAndBudgets(users, groups, categories) {
  let budgets = [];
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length];
    const group = groups[i % groups.length];

    const budget = new Budget({
      totalBudget: Math.floor(Math.random() * 1000) + 500,
      purpose: `Budget ${i + 1}`,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      userId: user._id,
      groupId: i % 2 === 0 ? null : group._id,
      budgetType: i % 2 === 0 ? "personal" : "group",
    });
    budgets.push(budget);
  }

  budgets = await Budget.insertMany(budgets);

  let expenses = [];
  budgets.forEach((budget) => {
    for (let j = 0; j < 3; j++) {
      const hashCode = budget._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const categoryIndex = (hashCode + j) % categories.length;
      const category = categories[categoryIndex];
      expenses.push(new Expense({
        amount: Math.floor(Math.random() * 100) + 1,
        date: new Date(),
        description: `Expense ${j + 1} for ${budget.purpose}`,
        budgetId: budget._id,
        categoryId: category._id,
        userId: budget.userId,
        groupId: budget.groupId,
      }));
    }
  });

  await Expense.insertMany(expenses);
}

async function main() {
  try {
    await mongoose.connection.dropDatabase();

    const users = await insertUsers();
    console.log("Users inserted");

    const groups = await insertGroups(users);
    console.log("Groups inserted");

    const categories = await insertExpenseCategories();
    console.log("Expense categories inserted");

    await createExpensesAndBudgets(users, groups, categories);
    console.log("Expenses and budgets created");
  } catch (error) {
    console.error("Error inserting test data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

main();

