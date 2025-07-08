/**
 * Application initialization and configuration
 * This file sets up additional components and configurations for the Express application
 */

const setupBillingScheduleCron = require('./utils/billing-schedule-cron');

/**
 * Initialize additional application components and features
 * @param {Object} app - Express application instance
 */
function initializeApp(app) {
  // Set up the billing schedule cron job
  setupBillingScheduleCron(app);
  
  console.log('Additional application components initialized');
}

module.exports = initializeApp;
