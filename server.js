const express = require("express");
const mongoose = require("mongoose");
const userAuthRoutes = require("./routes/userAuth");
const budgetManagementRoutes = require("./routes/budgetManagement");
const expenseCategoryServiceRoutes = require("./routes/expenseCategoryService");
const groupCollaborationServiceRoutes = require("./routes/groupCollaborationService");
const expenseTrackingServiceRoutes = require("./routes/expenseTrackingService");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/users", userAuthRoutes);
app.use("/budgets", budgetManagementRoutes);
app.use("/expensecategories", expenseCategoryServiceRoutes);
app.use("/groups", groupCollaborationServiceRoutes);
app.use("/expenses", expenseTrackingServiceRoutes);

async function startServer() {
  try {
    await mongoose.connect("mongodb://localhost:27017/budgetbuddy");
    console.log("Connected to MongoDB");
    app.listen(port, () =>
      console.log(`Example app listening at http://localhost:${port}`)
    );
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

startServer();
