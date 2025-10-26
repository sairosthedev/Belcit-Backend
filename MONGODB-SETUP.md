# MongoDB Setup Instructions

## Option 1: Install MongoDB Community Server (Local)

### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select Windows and download the MSI installer
3. Run the installer and follow the setup wizard
4. Choose "Complete" installation

### Step 2: Start MongoDB Service
After installation, MongoDB should start automatically. If not:
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

### Step 3: Verify Installation
```bash
# Test MongoDB connection
mongosh
# or
mongo
```

### Step 4: Restart Backend Server
```bash
cd Belcit-Backend
npm start
```

---

## Option 2: Use MongoDB Atlas (Cloud) - Easier Setup

### Step 1: Create Free Account
1. Go to: https://www.mongodb.com/atlas
2. Sign up for free account
3. Create a new cluster (free tier available)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: mongodb+srv://username:password@cluster.mongodb.net/)

### Step 3: Set Environment Variable
Create a `.env` file in Belcit-Backend folder:
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/belcit
```

### Step 4: Restart Backend Server
```bash
cd Belcit-Backend
npm start
```

---

## Quick Test
After setup, test the database connection:
```bash
cd Belcit-Backend
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/belcit').then(() => console.log('✅ MongoDB Connected!')).catch(err => console.error('❌ Connection failed:', err.message));"
```

## Expected Result
Once MongoDB is running, you should see:
- ✅ "MongoDB Connected: localhost" in backend logs
- ✅ Attendance records being saved
- ✅ Records appearing in the attendance table
- ✅ Proper checkout functionality
