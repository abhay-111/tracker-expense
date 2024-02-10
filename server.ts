import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
// const { Request, Response } = require("@types/express");
import express from "express";

const app = express();
const prisma = new PrismaClient();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.post("/fixed-expenses", async (req: Request, res: Response) => {
  const expenses = await prisma.fixedExpenses.findFirst({});
  if (!expenses) {
    await prisma.fixedExpenses.create({
      data: {
        ...req.body,
      },
    });
  } else {
    const expenses = await prisma.fixedExpenses.findFirst({});
    await prisma.fixedExpenses.update({
      where: {
        id: expenses?.id,
      },
      data: {
        ...req.body,
      },
    });
  }
});
app.get("/fixed-expenses", async (req: Request, res: Response) => {
  const expenses = await prisma.fixedExpenses.findFirst({});
  console.log(expenses, req.body);
  let total = 0;
  if (expenses) {
    total =
      expenses.cook +
      expenses.househelp +
      expenses.montlyRent +
      expenses.sentHome +
      expenses.wifi;
  }
  return res.json({
    staus: 200,
    expenses: expenses,
    totalFixedExpenses: total,
  });
});
app.post("/add-daily-expense", async (req: Request, res: Response) => {
  await prisma.dailyExpense.create({
    data: {
      ...req.body,
    },
  });
  return res.json({
    status: 200,
    data: "Expense added successfully",
  });
});

app.get("/get-monthly-chart", async (req: Request, res: Response) => {
  const allExpenses = await prisma.dailyExpense.findMany({});
  const currentMonthChart: any = {};
  let totalMonthExpense = 0;

  const currentMonth = new Date().getMonth();
  console.log(currentMonth);
  allExpenses.forEach((expense) => {
    const currDateMonth = new Date(expense.date).getMonth();
    const currDateDay = new Date(expense.date).getDate();
    const dateString = new Date(expense.date).toDateString();
    // console.log(currDateMonth, currentMonth);
    if (currDateMonth == currentMonth) {
      if (!currentMonthChart[currDateDay]) {
        currentMonthChart[currDateDay] = {
          total: 0,
          name: dateString,
        };
      }
      totalMonthExpense += expense.amount;
      currentMonthChart[currDateDay].total += expense.amount;
    }
  });
  return res.json({
    status: 200,
    monthlyChart: currentMonthChart,
    totalMonthExpense,
  });
});
app.get("/get-yearly-chart", async (req: Request, res: Response) => {
  const allExpenses = await prisma.dailyExpense.findMany({});
  const yearChart: any = {};
  for (let month = 0; month < 12; month++) {
    let totalMonthExpense = 0;
    allExpenses.forEach((expense) => {
      const currDateMonth = new Date(expense.date).getMonth();
      // console.log(currDateMonth, currentMonth);
      if (currDateMonth == month) {
        if (!yearChart[month]) {
          yearChart[month] = {
            total: 0,
            name: month,
          };
        }
        totalMonthExpense += expense.amount;
        yearChart[month].total += expense.amount;
      }
    });
  }
  console.log(yearChart);
  return res.json({
    status: 200,
    yearlyChart: yearChart,
  });
});
const PORT = 8000;
app.listen(PORT || 8000, async () => {
  console.log("Server up and running at PORT = " + PORT);
});
