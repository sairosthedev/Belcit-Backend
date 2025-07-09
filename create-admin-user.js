// Usage: node create-admin-user.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Staff = require('./src/models/staff.model');

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    idNumber: 'A0001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    phonenumber: '0712345678',
    email: 'admin@example.com',
    status: 'active',
  },
  {
    firstName: 'Manager',
    lastName: 'User',
    idNumber: 'M0001',
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    phonenumber: '0723456789',
    email: 'manager@example.com',
    status: 'active',
  },
  {
    firstName: 'Cashier',
    lastName: 'User',
    idNumber: 'C0001',
    username: 'cashier',
    password: 'cashier123',
    role: 'cashier',
    phonenumber: '0734567890',
    email: 'cashier@example.com',
    status: 'active',
  },
  {
    firstName: 'Stock',
    lastName: 'Clerk',
    idNumber: 'S0001',
    username: 'stockclerk',
    password: 'stockclerk123',
    role: 'stockClerk',
    phonenumber: '0745678901',
    email: 'stockclerk@example.com',
    status: 'active',
  },
  {
    firstName: 'Super',
    lastName: 'Admin',
    idNumber: 'SA0001',
    username: 'superadmin',
    password: 'superadmin123',
    role: 'superAdmin',
    phonenumber: '0756789012',
    email: 'superadmin@example.com',
    status: 'active',
  },
];

async function resetUsers() {
  await connectDB();
  await Staff.deleteMany({});
  console.log('All users deleted.');
  for (const user of users) {
    await Staff.create(user);
    console.log(`Created user: ${user.username} (${user.role})`);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

resetUsers(); 