const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const requireAuth = require("./middlewares/requireAuth");
const userAuthRoutes = require("./routes/userAuth");
const userManagementRoutes = require("./routes/userManagement");
const budgetManagementRoutes = require("./routes/budgetManagement");
const expenseCategoryServiceRoutes = require("./routes/expenseCategoryService");
const groupCollaborationServiceRoutes = require("./routes/groupCollaborationService");
const expenseTrackingServiceRoutes = require("./routes/expenseTrackingService");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", userAuthRoutes);

app.use(requireAuth);
app.use("/api/users", userManagementRoutes);
app.use("/api/budgets", budgetManagementRoutes);
app.use("/api/expensecategories", expenseCategoryServiceRoutes);
app.use("/api/groups", groupCollaborationServiceRoutes);
app.use("/api/expenses", expenseTrackingServiceRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

module.exports = app;