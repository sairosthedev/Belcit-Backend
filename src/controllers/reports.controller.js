const Sale = require("../models/sale.model");
const Product = require("../models/product.model");
const Expense = require("../models/expense.model");

// Profit/Loss report
exports.profitLoss = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    // Total sales revenue
    const sales = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      { $group: { _id: null, revenue: { $sum: "$items.total" } } },
    ]);
    // Total COGS (cost of goods sold)
    const cogs = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      { $group: { _id: null, cogs: { $sum: { $multiply: ["$items.quantity", "$productInfo.cost"] } } } },
    ]);
    // Total expenses
    const expenses = await Expense.aggregate([
      ...(start && end ? [{ $match: { date: { $gte: new Date(start), $lte: new Date(end) } } }] : []),
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const revenue = sales[0]?.revenue || 0;
    const totalCogs = cogs[0]?.cogs || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const profit = revenue - totalCogs - totalExpenses;
    res.json({ revenue, cogs: totalCogs, expenses: totalExpenses, profit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Category sales report
exports.categorySales = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const sales = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      { $group: { _id: "$productInfo.category", totalSales: { $sum: "$items.total" }, quantity: { $sum: "$items.quantity" } } },
      { $sort: { totalSales: -1 } },
    ]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Top-selling products
exports.topSellingProducts = async (req, res) => {
  try {
    const { start, end, limit = 10 } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const sales = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
    ]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sales by cashier
exports.salesByCashier = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const sales = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$cashier",
          totalSales: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Expense breakdown
exports.expenseBreakdown = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const expenses = await Expense.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.topProducts = async (req, res) => {
  try {
    const { start, end, limit = 5 } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    // Aggregate sales by product
    const top = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          sold: 1,
          revenue: 1
        }
      }
    ]);
    res.json(top);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sales Over Time (daily totals)
exports.salesOverTime = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const sales = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          sales: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(sales.map(d => ({ date: d._id, sales: d.sales })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Expenses Over Time (daily totals)
exports.expensesOverTime = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const expenses = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          expenses: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(expenses.map(d => ({ date: d._id, expenses: d.expenses })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sales by Category
exports.salesByCategory = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const sales = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          revenue: { $sum: "$items.total" }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    res.json(sales.map(d => ({ category: d._id, revenue: d.revenue })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 