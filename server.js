require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./src/config/database");
const errorHandler = require("./src/middleware/error.middleware");

// Import routes
const authRoutes = require("./src/routes/auth.routes");
const vendorRoutes = require("./src/routes/vendor.routes");
const staffRoutes = require("./src/routes/staff.routes");
const ticketRoutes = require("./src/routes/ticket.routes");
const settingRoutes = require("./src/routes/setting.routes");
const fineRoutes = require("./src/routes/fine.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const currencyRoutes = require("./src/routes/currency.routes");
const reconciliationRoutes = require("./src/routes/reconciliation.routes");
const shiftRoutes = require("./src/routes/shift.routes");
const statsRoutes = require("./src/routes/stats.routes");
const lineItemsRoutes = require("./src/routes/line-items.routes");
const billingRoutes = require("./src/routes/billing.routes");
const controlAccountRoutes = require("./src/routes/control-account.routes");
const customersRoutes = require("./src/routes/customers.routes");
const paymentMethodsRoutes = require("./src/routes/payment-methods.routes");
const billingScheduleRoutes = require("./src/routes/billing-schedules.routes");
const productRoutes = require("./src/routes/product.routes");
const categoryRoutes = require("./src/routes/category.routes");
const unitRoutes = require("./src/routes/unit.routes");
const inventoryRoutes = require("./src/routes/inventory.routes");
const saleRoutes = require("./src/routes/sale.routes");
const purchaseRoutes = require("./src/routes/purchase.routes");
const expenseRoutes = require("./src/routes/expense.routes");
const reportRoutes = require("./src/routes/report.routes");
const stocktakeRoutes = require("./src/routes/stocktake.routes");

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // your frontend URL
  credentials: true,              // allow cookies/session
}));
app.use(helmet());
app.use(morgan("dev"));

// Add a root route for health check or friendly message
app.get('/', (req, res) => {
  res.send('BELCIT Supermarket Backend is running! Visit /api for API endpoints.');
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/fine", fineRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/reconciliation", reconciliationRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/line-items", lineItemsRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/control-accounts", controlAccountRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/payment-methods", paymentMethodsRoutes);
app.use("/api/billing-schedules", billingScheduleRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/stocktakes", stocktakeRoutes);

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Mbare Marketplace API Documentation",
      version: "1.0.0",
      description: "API documentation for Mbare Marketplace Management System",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    // servers: [
    //   {
    //     url: `http://localhost:${PORT}`,
    //   },
    //   {
    //     url: `http://20.116.222.250`,
    //   },
    // ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// Initialize additional application components (including billing schedule cron job)
const initializeApp = require("./src/app");
initializeApp(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
