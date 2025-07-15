const Ticket = require("../../models/ticket.model");
const Staff = require("../../models/staff.model");
const Customer = require("../../models/customer.model");
const LineItem = require("../../models/line-items.model");
const { PAYMENT_TYPES_ENUM } = require("../../config/payment-type");
const mongoose = require("mongoose");
const { generateBill } = require("../tickets/billing.controller");

exports.createTicket = async (req, res) => {
  const { ticketType, entryTime, status, customerId, lineItemId } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Fetch cashier details
    // const cashier = await Staff.findById(cashierId);
    // if (!cashier) {
    //   return res.status(400).json({ error: "Cashier does not exist, ticket cannot be created" });
    // }
    const result = await generateBill(
      {
        ...req,
        body: {
          lineItems: [lineItemId],
          customerId,
          type: ticketType,
          description: `${ticketType} ticket`,
        },
      },
      res,
      session
    );

    const newTicket = await new Ticket({
      lineItemId,
      billId: result?.bill._id,
      ticketType,
      status,
      ticketNumber: '',
      entryTime,
    }).save({ session });

    const ticket = await Ticket.findById(newTicket._id)
      .populate("billId lineItemId")
      .session(session);

    await session.commitTransaction();
    session.endSession();
    res.json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: "Internal Server error" });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("billId lineItemId")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error("Error retrieving tickets:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve tickets due to server error" });
  }
};

exports.getTicketByNumber = async (req, res) => {
  const { ticketNumber } = req.params;
  try {
    const ticket = await Ticket.findOne({ ticketNumber })
      .populate("billId lineItemId")
      .sort({ createdAt: -1 });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    console.error("Error retrieving ticket:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve ticket due to server error" });
  }
};

exports.updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { ticketStatus } = req.body;

  try {
    const ticket = await Ticket.findOneAndUpdate(
      { ticketNumber: id },
      { "details.ticketStatus": ticketStatus },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    res.json({ message: "Ticket updated", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res
      .status(500)
      .json({ error: "Failed to update ticket status due to server error" });
  }
};

async function generateTicketNumber(ticketType, session) {
  try {
    const date = new Date();
    const ddmmyy = date.toISOString().slice(0, 10).replace(/-/g, "").slice(2);

    // Determine prefix based on ticket type
    let prefix;
    switch (ticketType) {
      case "toilet":
        prefix = "MKT";
        break;
      case "fine":
        prefix = "MKF";
        break;
      case "parking":
        prefix = "MKP";
        break;
      case "onboarding":
        prefix = "MKO";
        break;
      default:
        throw new Error("Invalid ticket type");
    }

    // Find latest ticket from today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const latestTicket = await Ticket.findOne({
      createdAt: { $gte: startOfDay },
    })
      .sort({ ticketNumber: -1 })
      .session(session);

    let nextNumber = 1;
    if (latestTicket) {
      const latestNumber = parseInt(
        latestTicket.ticketNumber.split("-")[2],
        10
      );
      if (!isNaN(latestNumber)) {
        nextNumber = latestNumber + 1;
      }
    }

    const ticketNumber = `${prefix}-${ddmmyy}-${nextNumber
      .toString()
      .padStart(5, "0")}`;
    console.log(`Generated ticket number: ${ticketNumber}`);
    return ticketNumber;
  } catch (error) {
    console.error("Error generating ticket number:", error);
    throw new Error("Failed to generate ticket number due to server error");
  }
}
