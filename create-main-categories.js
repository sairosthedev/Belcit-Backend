require('dotenv').config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const Category = require("./src/models/category.model");

const mainCategories = [
  "Fresh Produce",
  "Butchery / Meat",
  "Bakery",
  "Dairy & Eggs",
  "Frozen Foods",
  "Groceries / Pantry",
  "Snacks & Confectionery",
  "Beverages",
  "Alcohol",
  "Health & Beauty",
  "Baby Products",
  "Toiletries",
  "Cleaning & Household",
  "Home & Kitchenware",
  "Pet Care",
  "Stationery & School Supplies",
  "Electronics & Accessories",
  "Clothing & Apparel",
  "Seasonal & Promotional",
  "Sales & special deals"
];

async function insertCategories() {
  try {
    await connectDB();
    for (const name of mainCategories) {
      const exists = await Category.findOne({ name });
      if (!exists) {
        await Category.create({ name });
        console.log(`Inserted: ${name}`);
      } else {
        console.log(`Already exists: ${name}`);
      }
    }
    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

insertCategories();