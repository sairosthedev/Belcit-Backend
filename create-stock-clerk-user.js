// Usage: node create-stock-clerk-user.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('./src/models/staff.model');

const MONGODB_URI = process.env.MONGODB_URI;

async function createStockClerk() {
  await mongoose.connect(MONGODB_URI);
  const username = 'stockclerk';
  const password = 'stockclerk123';
  const hashed = await bcrypt.hash(password, 10);
  const user = await Staff.findOneAndUpdate(
    { username },
    {
      username,
      password: hashed,
      firstName: 'Stock',
      lastName: 'Clerk',
      role: 'stockClerk',
      status: 'active',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Stock Clerk user created/updated:', {
    username,
    password,
    role: user.role,
    active: user.active,
    id: user._id,
  });
  await mongoose.disconnect();
}

createStockClerk().catch(err => {
  console.error(err);
  process.exit(1);
}); 