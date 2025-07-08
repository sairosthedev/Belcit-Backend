const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");
const {
  createBillingSchedule,
  getBillingSchedules,
  updateBillingSchedule,
  deleteBillingSchedule,
  getBillingScheduleById,
  runBillingSchedule,
  createInvoiceTemplate,
  getInvoiceTemplates,
} = require("../controllers/tickets/billing-schedule.controller");
/*
 * Create Billing Schedule
 */
router.post(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  createBillingSchedule
);

/*
 * Create Billing Schedule
 */
router.post(
  "/templates",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  createInvoiceTemplate
);

/*
 * Get all bill schedules
 */
router.get(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  getBillingSchedules
);

/*
 * Get bill schedule by id
 */
router.get(
  "/templates",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  getInvoiceTemplates
);

/*
 * Get bill schedule by id
 */
router.get(
  "/:id",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  getBillingScheduleById
);
/*
 * Update bill schedule
 */
router.put(
  "/:id",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  updateBillingSchedule
);

/*
 * Run billing schedule process
 * This endpoint is called by the cron job to process all active billing schedules
 */
router.post(
  "/run",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  runBillingSchedule
);

module.exports = router;
