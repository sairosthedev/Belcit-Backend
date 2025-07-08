const mongoose = require("mongoose");
const billingScheduleModel = require("../../models/billing-schedule.model");
const Customer = require("../../models/customer.model");
const LineItem = require("../../models/line-items.model");
const { generateBill } = require("./billing.controller");
const {
  calculateNextBillingDate,
  getInitialNextBillingDate,
} = require("../../utils/calculate-next-billing-date");
const invoiceTemplateModel = require("../../models/invoice-template.model");

/**
 * Computes the due date for a bill based on the billing date
 * Typically due dates are set to a certain number of days after the billing date
 * @param {Date} billingDate - The date the bill is generated
 * @returns {Date} - The due date for the bill
 */
function computeDueDate(billingDate) {
  const dueDate = new Date(billingDate);
  // Set due date to 14 days after billing date (or adjust as needed)
  dueDate.setDate(dueDate.getDate() + 14);
  return dueDate;
}
const createBillingSchedule = async (req, res) => {
  const { billingFrequency, description, startDate, endDate, isActive } =
    req.body;

  // Validate input
  if (!billingFrequency || !startDate) {
    return res.status(400).json({ message: "Invalid input, " });
  }

  try {
    let nextBillingDate = getInitialNextBillingDate(
      startDate,
      billingFrequency.onDate
    );

    const newSchedule = new billingScheduleModel({
      description,
      billingFrequency,
      startDate,
      nextBillingDate,
      leaseIds: [],
      endDate: endDate || null,
      isActive,
    });

    await newSchedule.save();

    return res.status(201).json({
      message: "Billing schedule created successfully",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error("Error creating billing schedule:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getBillingSchedules = async (req, res) => {
  try {
    const schedules = await billingScheduleModel.find();
    //.populate("invoiceTemplateIds");

    return res.status(200).json(schedules);
  } catch (error) {
    console.error("Error retrieving billing schedules:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateBillingSchedule = async (req, res) => {
  const { id } = req.params;
  const { billingFrequency, invoiceTemplateIds } = req.body;

  // Validate input
  if (!billingFrequency || !invoiceTemplateIds) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const invoiceTemp = await invoiceTemplateModel.find({
      _id: { $in: invoiceTemplateIds },
    });
    if (invoiceTemp.length !== invoiceTemplateIds.length) {
      return res
        .status(404)
        .json({ message: "One or more invoice templates not found" });
    }
    const updatedSchedule = await billingScheduleModel.findByIdAndUpdate(
      id,
      {
        // billingFrequency,
        // nextBillingDate,
        invoiceTemplateIds: invoiceTemp.map((temp) => temp._id),
      },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    return res.status(200).json({
      message: "Billing schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating billing schedule:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBillingSchedule = async (req, res) => {};

const getBillingScheduleById = async (req, res) => {
  const { id } = req.params;
  try {
    const schedule = await billingScheduleModel
      .findById(id)
      .populate("invoiceTemplateIds");
    if (!schedule) {
      return res.status(404).json({ message: "Billing schedule not found" });
    }
    return res.status(200).json(schedule);
  } catch (error) {
    console.error("Error retrieving billing schedule by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const runBillingSchedule = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const today = new Date();
    const schedules = await billingScheduleModel
      .find({
        isActive: true,
        nextBillingDate: { $lte: today },
      })
      .populate({
        path: "invoiceTemplateIds",
        match: { status: "active" },
      })
      .session(session);

    for (const schedule of schedules) {
      for (const template of schedule.invoiceTemplateIds) {
        const customer = await Customer.findById(template.customerId).session(
          session
        );
        const lineItems = await LineItem.find({
          _id: { $in: template.lineItems },
        }).session(session);

        // lineItems, customerId, type, description, dueDate
        await generateBill(
          {
            ...req,
            body: {
              type: "rent", // or whatever enum you use
              dueDate: computeDueDate(schedule.nextBillingDate),
              customerId: customer._id,
              lineItems: lineItems.map((item) => ({
                _id: item._id,
              })),
              // billingScheduleId: schedule._id,
            },
          },
          res,
          session
        );

        // Optionally update balances or logs here
      }

      // update the nextBillingDate for this schedule
      schedule.nextBillingDate = calculateNextBillingDate(
        schedule.nextBillingDate,
        schedule.billingFrequency.frequency,
        schedule.billingFrequency.occurrence
      );
      await schedule.save({ session });
    }
    // then we return
    return res.status(200).json({
      message: "Billing schedule run successfully",
      schedules,
    });
  } catch (error) {
    console.error("Error running billing schedule:", error);
    await session.abortTransaction();
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

const createInvoiceTemplate = async (req, res) => {
  // This function is not implemented yet
  const { lineItems, customer, chargeTarget, description, name, meta } =
    req.body;
  try {
    // Validate input
    if (!lineItems || !customer || !chargeTarget || !name) {
      return res.status(400).json({
        message: "Line items, customer ID, charge target and name are required",
      });
    }

    const dbCustomer = await Customer.findById(customer);
    if (!dbCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Validate line items
    const dbItems = [];
    for (const item of lineItems) {
      const lineItem = await LineItem.findById(item);
      if (!lineItem) {
        return res.status(404).json({ message: "Line item not found" });
      }
      dbItems.push(lineItem);
    }

    // Create the invoice template
    const newTemplate = new invoiceTemplateModel({
      lineItems: dbItems,
      customerId: customer,
      chargeTarget,
      description,
      name,
      meta,
    });

    await newTemplate.save();

    return res.status(201).json({
      message: "Invoice template created successfully",
      template: newTemplate,
    });
  } catch (error) {
    console.error("Error creating invoice template:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getInvoiceTemplates = async (req, res) => {
  const { chargeTarget } = req.query;
  const match = {};
  if (chargeTarget) {
    match.chargeTarget = chargeTarget;
  }
  try {
    const templates = await invoiceTemplateModel
      .find(match)
      .populate("customerId");
    return res.status(200).json(templates);
  } catch (error) {
    console.error("Error retrieving invoice templates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createBillingSchedule,
  getBillingSchedules,
  updateBillingSchedule,
  deleteBillingSchedule,
  getBillingScheduleById,
  runBillingSchedule,
  createInvoiceTemplate,
  getInvoiceTemplates,
};
