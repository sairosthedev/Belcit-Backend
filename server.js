require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./src/config/database");
const errorHandler = require("./src/middleware/error.middleware");

// Import routes
const authRoutes = require("./src/routes/auth.routes");;
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
const vendorsRoutes = require("./src/routes/vendors.routes");

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS configuration to allow requests from Vercel frontend and localhost
const allowedOrigins = [
  'http://localhost:3000',              // Local development
  'http://localhost:3001',
  'https://belcit-frontend.vercel.app/',             
  /^https:\/\/.*\.vercel\.app$/,       // All Vercel preview deployments
  /^https:\/\/.*\.render\.com$/,       // All Render frontend deployments
  process.env.FRONTEND_URL,             // Custom frontend URL from env
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    })) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,              // allow cookies/session
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());
app.use(morgan("dev"));

// Add a root route for health check or friendly message
app.get('/', (req, res) => {
  res.send('BELCIT Supermarket Backend is running! Visit /api for API endpoints.');
});

// Routes
app.use("/api/auth", authRoutes);
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
app.use("/api/vendors", vendorsRoutes);

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "BELCIT TRADING Supermarket System API Documentation",
      version: "1.0.0",
      description: "API documentation for BELCIT TRADING Supermarket System",
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
    //     url: `http://localhost:${PORT}`,6001051004164
    
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
