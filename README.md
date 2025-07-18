# BELCIT Supermarket Management System Backend

This backend powers the BELCIT Trading supermarket in Victoria Falls. It provides a robust RESTful API for managing products, inventory, sales (POS), purchases, expenses, staff, customers, vendors, and more.

## Features
- **Product Management**: CRUD for products, categories, and units (e.g., kg, litre, piece)
- **Inventory Management**: Stock in/out, adjustments, low stock alerts
- **Sales (POS)**: Record sales, generate receipts, daily sales tracking
- **Purchases**: Supplier orders, receive stock into inventory
- **Expenses**: Track supermarket expenses
- **Staff, Customers, Vendors**: Manage all key people and organizations
- **Payments & Financials**: Record and allocate payments
- **Reports**: Daily sales, low stock, purchase history, and more

## API Modules & Endpoints
- `/api/products` — Products CRUD
- `/api/categories` — Product categories CRUD
- `/api/units` — Product units CRUD
- `/api/inventory` — Stock in/out, adjustments, low stock
- `/api/sales` — POS sales, receipts, daily sales
- `/api/purchases` — Supplier orders, receive stock
- `/api/expenses` — Track expenses
- `/api/vendors`, `/api/customers`, `/api/staff` — Manage people
- `/api/payments` — Record payments

## Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and set your MongoDB URI and other settings.
3. **Run the server:**
   ```bash
   npm start
   ```
4. **API Docs:**
   - Visit `/api-docs` for Swagger UI and full API documentation.

## Database
- Uses MongoDB (Mongoose ODM)
- Models for all major entities: Product, Category, Unit, Sale, Purchase, Expense, Staff, Vendor, Customer, etc.

## Example API Usage
- **Add a product:** `POST /api/products`
- **Stock in:** `POST /api/inventory/stock-in`
- **Make a sale:** `POST /api/sales`
- **Record an expense:** `POST /api/expenses`

## Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

## License
MIT #   B e l c i t - B a c k e n d  
 