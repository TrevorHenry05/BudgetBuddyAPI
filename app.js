const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const requireAuth = require("./middlewares/requireAuth");
const handleError = require("./middlewares/handleError");
const userAuthRoutes = require("./routes/userAuth");
const userManagementRoutes = require("./routes/userManagement");
const budgetManagementRoutes = require("./routes/budgetManagement");
const expenseCategoryServiceRoutes = require("./routes/expenseCategoryService");
const groupCollaborationServiceRoutes = require("./routes/groupCollaborationService");
const expenseTrackingServiceRoutes = require("./routes/expenseTrackingService");
const userAggregationRoutes = require("./routes/userAggregationService");
const groupAggregationRoutes = require("./routes/groupAggregationService");
const groupAnalysisRoutes = require("./routes/groupAnalysisService");
const userAnalysisRoutes = require("./routes/userAnalysisService");
const userAdminServiceRoutes = require("./routes/userAdminService");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", userAuthRoutes);

app.use(requireAuth);
app.use("/api/users", userManagementRoutes);
app.use("/api/budgets", budgetManagementRoutes);
app.use("/api/expensecategories", expenseCategoryServiceRoutes);
app.use("/api/groups", groupCollaborationServiceRoutes);
app.use("/api/expenses", expenseTrackingServiceRoutes);
app.use("/api/aggregation/user", userAggregationRoutes);
app.use("/api/aggregation/group", groupAggregationRoutes);
app.use("/api/analysis/group", groupAnalysisRoutes);
app.use("/api/analysis/user", userAnalysisRoutes);
app.use("/api/admin", userAdminServiceRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use(handleError);

module.exports = app;
