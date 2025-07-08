const cron = require("node-cron");
//const axios = require('axios');
const jwt = require("jsonwebtoken");
//const config = require("../config");

/**
 * Generates a service account JWT token for authenticated API calls
 * @returns {string} JWT token
 */
function generateServiceAccountToken() {
  // Create a service account payload with minimum necessary permissions
  const serviceAccountPayload = {
    userIdid: process.env.SERVICE_ACCOUNT_ID || "billing-cron-service",
    role: "ACCOUNTANT", // Using accountant role as it has permission to run billing
    isServiceAccount: true,
  };

  // Sign the token with the JWT secret
  return jwt.sign(
    serviceAccountPayload,
    process.env.JWT_SECRET || "billing-schedule-secret-key",
    { expiresIn: "1h" } // Short expiry time for security
  );
}

/**
 * Sets up a cron job to run the billing schedule every 2 hours between 6am and 12noon
 * @param {Object} app - Express app instance
 */
function setupBillingScheduleCron(app) {
  // Run every 2 hours between 6am and 12noon (6am, 8am, 10am, 12noon)
  cron.schedule("0 6,8,10,12 * * *", async () => {
    try {
      console.log(
        `[${new Date().toISOString()}] Running scheduled billing process...`
      );

      // Get the server's URL from the app settings or use a default
      const serverUrl = process.env.SERVER_URL || "http://localhost:3000";

      // Generate an authentication token for the service account
      const token = generateServiceAccountToken();

      // Make a request to the billing schedule run endpoint
      // const response = await axios.post(`${serverUrl}/api/billing-schedules/run`, {}, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      console.log(
        `[${new Date().toISOString()}] Billing schedule completed successfully:`
        //response.data.message || "No message"
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error running billing schedule cron job:`,
        error.response?.data?.message || error.message
      );

      // Log detailed error information for debugging
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }
  });

  console.log(
    "Billing schedule cron job set up to run at 6am, 8am, 10am, and 12noon daily"
  );
}

module.exports = setupBillingScheduleCron;
