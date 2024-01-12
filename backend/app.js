const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const expenseCategoriesRoutes = require('./routes/category-expense.routes');
const incomeCategoriesRoutes = require('./routes/category-income.routes');
const operationsRoutes = require('./routes/operation.routes');
const balanceRoutes = require('./routes/balance.routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api/categories/expense", expenseCategoriesRoutes);
app.use("/api/categories/income", incomeCategoriesRoutes);
app.use("/api/operations", operationsRoutes);
app.use("/api/balance", balanceRoutes);

app.listen('3000', () => console.log(`Server started`));