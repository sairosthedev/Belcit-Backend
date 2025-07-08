# BELCIT Supermarket Management System Frontend

This is the frontend for the BELCIT Trading supermarket management system, built with **React + Vite**. It provides a modern, responsive interface for managing products, inventory, sales, purchases, expenses, reporting, and more.

---

## 🚀 Project Overview
- **Tech Stack:** React (JSX), Vite, Axios, React Router, Context API (or Redux/Zustand), modern CSS (Tailwind, CSS Modules, or styled-components)
- **Purpose:** Enable supermarket staff and management to efficiently run daily operations, track sales, manage stock, and analyze business performance.
- **Audience:** Cashiers, managers, stock clerks, and administrators.

---

## 👥 User Roles & Flows
- **Cashier:**
  - Login, scan products, process sales, print receipts, view daily sales.
- **Manager/Admin:**
  - Access dashboard, manage products, view reports, approve expenses, oversee staff, run stocktakes.
- **Stock Clerk:**
  - Receive stock, perform stocktakes, adjust inventory, report discrepancies.

---

## 📁 Folder Structure (with Descriptions)
```
supermarket-frontend/
│
├── public/                  # Static files (favicon, robots.txt, index.html)
│
├── src/
│   ├── assets/              # Images, global styles, fonts
│   ├── components/          # Reusable and feature-specific UI
│   │   ├── common/          # Buttons, Modals, Tables, Loaders, etc.
│   │   ├── products/        # Product forms, lists, editors
│   │   ├── sales/           # POS, cart, receipt, barcode input
│   │   ├── inventory/       # Stock in/out, adjustments
│   │   ├── purchases/       # Supplier order forms, lists
│   │   ├── expenses/        # Expense forms, lists
│   │   ├── reports/         # Charts, tables for analytics
│   │   ├── stocktake/       # Stock audit forms, discrepancy views
│   │   ├── barcode/         # Barcode scanner integration
│   │   └── dashboard/       # Dashboard widgets, stats
│   │
│   ├── pages/               # Route-level views (one per main screen)
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── SalesPage.jsx
│   │   ├── PurchasesPage.jsx
│   │   ├── ExpensesPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── StocktakePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── api/                 # API calls (Axios)
│   │   ├── axios.js         # Axios instance/config
│   │   ├── products.js      # Product API
│   │   ├── inventory.js     # Inventory API
│   │   ├── sales.js         # Sales/POS API
│   │   ├── purchases.js     # Purchases API
│   │   ├── expenses.js      # Expenses API
│   │   ├── reports.js       # Reporting API
│   │   ├── stocktake.js     # Stocktaking API
│   │   └── auth.js          # Auth API
│   │
│   ├── context/             # React context (Auth, App-wide state)
│   │   ├── AuthContext.jsx
│   │   └── AppContext.jsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useDebounce.js
│   │
│   ├── utils/               # Helpers, formatters, constants
│   │   ├── formatters.js
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   ├── router/              # React Router config
│   │   └── index.jsx
│   │
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Vite entry point
│   └── index.css            # Global styles
│
├── .env                     # API base URL, etc.
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## 🟢 Key Features (with Details)
- **Authentication:** Secure login, role-based access (cashier, manager, etc.)
- **Dashboard:** Real-time stats (sales, stock, alerts), quick links
- **Product Management:** Add/edit/delete products, barcode lookup, category/unit management
- **Inventory:** Stock in/out, adjustments, low stock alerts, inventory history
- **Sales (POS):**
  - Fast checkout with barcode scanning (see below)
  - Cart management, discounts, payment types
  - Receipt printing (see below)
- **Purchases:** Create supplier orders, receive stock, view purchase history
- **Expenses:** Record and categorize expenses, view expense history
- **Reports:** Profit/loss, category sales, top products, cashier performance, expense breakdowns
- **Stocktaking:** Submit stock counts, view discrepancies, confirm adjustments
- **Multi-branch (optional):** Branch selection, branch-level data and reporting

---

## 📦 Barcode Scanning Integration
- Use a USB barcode scanner (acts as keyboard input) or a camera-based scanner (e.g., `react-barcode-reader`)
- On the POS page, focus the barcode input field; scanning auto-fills and adds product to cart
- API: `GET /api/products/barcode/:barcode` fetches product details instantly

---

## 🧾 Receipt Printing
- After a sale, the app displays a printable receipt (HTML)
- Use `react-to-print` or browser print dialog for physical receipts
- Optionally, generate PDF receipts with `jspdf`
- API: `GET /api/sales/:id/receipt` returns a ready-to-print HTML receipt

---

## 🛠️ Setup & Development
1. **Clone the repo:**
   ```bash
   git clone <repo-url> supermarket-frontend
   cd supermarket-frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn
   ```
3. **Configure environment:**
   - Create a `.env` file:
     ```env
     VITE_API_BASE_URL=http://localhost:3000/api
     ```
4. **Run the app:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Build for production:**
   ```bash
   npm run build
   # or
   yarn build
   ```

---

## 🧩 Recommended Libraries
- **UI:** MUI, Ant Design, Chakra UI, or Tailwind CSS
- **Forms:** Formik, React Hook Form
- **State:** Context API, Redux Toolkit, or Zustand
- **HTTP:** Axios
- **Routing:** React Router v6+
- **Barcode:** `react-barcode-reader` or similar
- **PDF/Print:** `react-to-print`, `jspdf`, or similar

---

## 📝 Extending the App
- **Add a new feature/page:**
  1. Create a new folder in `src/components/` and a new page in `src/pages/`
  2. Add API calls in `src/api/`
  3. Add a route in `src/router/index.jsx`
  4. Use context or hooks for state as needed
- **Add a new API endpoint:**
  1. Add a function in the relevant `src/api/*.js` file
  2. Use it in your components/pages
- **Add a new user role:**
  1. Update AuthContext and role checks in components/pages

---

## ❓ Troubleshooting & FAQ
- **Q: Barcode scanner not working?**
  - A: Make sure the barcode input is focused. Test with a regular USB scanner first.
- **Q: API requests fail?**
  - A: Check your `.env` for the correct `VITE_API_BASE_URL` and ensure the backend is running.
- **Q: Styles not applying?**
  - A: Check your CSS import order and ensure you’re using the right class names.
- **Q: How do I reset my password?**
  - A: Implement a password reset flow or ask your admin to reset it in the backend.
- **Q: How do I add a new branch?**
  - A: Add branch data in the backend, then update the frontend to select/filter by branch.

---

## 📚 Example API Usage
- **Get products:** `GET /api/products`
- **Stock in:** `POST /api/inventory/stock-in`
- **Make a sale:** `POST /api/sales`
- **Print receipt:** `GET /api/sales/:id/receipt`
- **Run report:** `GET /api/reports/profit-loss?start=YYYY-MM-DD&end=YYYY-MM-DD`

---

## 💡 Tips
- Use barcode scanning for fast sales and stock-in
- Use the dashboard for daily business health
- Regularly run stocktakes to keep inventory accurate
- Use reports to drive business decisions

---

## 🤝 Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

---

## 📄 License
MIT 