const express = require("express");
const axios = require("axios");
const QuickChart = require("quickchart-js");

const router = express.Router();

const colors = {
  lightPurple: "#C8A2C8", // A light purple shade
  yellow: "#FFD700", // A shade of yellow
  turquoise: "#30D5C8", // A shade of turquoise
};

const generatePercentOfBudgetsUsedCharts = (data) => {
  let usedBudgetGraphs = [];
  data.forEach((budget) => {
    const total = budget.totalBudget;
    const totalExpenses = budget.expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    const percentUsed = (totalExpenses / total) * 100;
    const percentRemaining = 100 - percentUsed;

    const chart = new QuickChart();
    chart
      .setConfig({
        type: "doughnut",
        data: {
          labels: ["Used", "Remaining"],
          datasets: [
            {
              data: [percentUsed, percentRemaining],
              backgroundColor: [colors.lightPurple, colors.turquoise],
              hoverBackgroundColor: [colors.lightPurple, colors.turquoise],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          plugins: {
            datalabels: {
              display: true,
              formatter: (value) => {
                return value.toFixed(2) + "%";
              },
            },
          },
        },
      })
      .setBackgroundColor("transparent");

    usedBudgetGraphs.push({
      budgetId: budget._id,
      chartUrl: chart.getUrl(),
      totalBudget: total,
      totalExpenses,
      percentUsed,
      percentRemaining,
      Purpose: budget.purpose,
    });
  });

  return usedBudgetGraphs;
};

const generateExpensesPerMonthChart = (data) => {
  let expensesPerMonth = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  const currentYear = new Date().getFullYear();
  data.forEach((budget) => {
    budget.expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const month = date.toLocaleString("default", { month: "long" });
      const expenseYear = date.getFullYear();

      if (expenseYear === currentYear) {
        expensesPerMonth[month] += expense.amount;
      }
    });
  });

  const chart = new QuickChart();
  chart.setConfig({
    type: "bar",
    data: {
      labels: Object.keys(expensesPerMonth),
      datasets: [
        {
          label: "Monthly Expenses",
          data: Object.values(expensesPerMonth),
          backgroundColor: colors.lightPurple,
          borderColor: colors.turquoise,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Expense Amount ($)",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "Monthly Expenses Overview",
        },
      },
    },
  });

  return {
    chartUrl: chart.getUrl(),
    expensesPerMonth,
  };
};

generateExpensesPerExpenseCategoryChart = (data) => {
  let expensesPerCategory = {};
  data.forEach((budget) => {
    budget.expenses.forEach((expense) => {
      if (!expensesPerCategory[expense.categoryName]) {
        expensesPerCategory[expense.categoryName] = 0;
      }
      expensesPerCategory[expense.categoryName] += expense.amount;
    });
  });

  const chart = new QuickChart();
  chart.setConfig({
    type: "bar",
    data: {
      labels: Object.keys(expensesPerCategory),
      datasets: [
        {
          label: "Category Expenses",
          data: Object.values(expensesPerCategory),
          backgroundColor: colors.lightPurple,
          borderColor: colors.turquoise,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Expense Amount ($)",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "Category Expenses Overview",
        },
      },
    },
  });

  return {
    chartUrl: chart.getUrl(),
    expensesPerCategory,
  };
};

router.get("", async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const response = await axios.get(
      `http://localhost:3000/api/aggregation/user`,
      {
        headers: { Authorization: token },
        timeout: 5000,
      }
    );

    const aggregatedData = response.data.aggregatedData || [];

    res.status(200).json({
      percentOfBudgetsUsed: generatePercentOfBudgetsUsedCharts(aggregatedData),
      expensesPerMonth: generateExpensesPerMonthChart(aggregatedData),
      expensesPerCategory:
        generateExpensesPerExpenseCategoryChart(aggregatedData),
      aggregatedUserData: aggregatedData,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
