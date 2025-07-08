const mongoose = require("mongoose");
const Ticket = require("../models/ticket.model");
const Bill = require("../models/bill.model");
const { PAYMENT_TYPES_ENUM } = require("../config/payment-type");

const AUTO_COMPLETE_TICKET_TYPES = [
  PAYMENT_TYPES_ENUM.PARKING,
  PAYMENT_TYPES_ENUM.TOILET,
];

/**
 * Returns ticket update behavior flags based on ticket type.
 *
 * @param {string} type - Ticket type e.g., "parking", "toilet"
 * @returns {{ autoComplete: boolean }}
 */
function getTicketUpdateFlags(type) {
  return {
    autoComplete: AUTO_COMPLETE_TICKET_TYPES.includes(type),
  };
}

/**
 * Handles logic to update ticket status and metadata on events like payment or exit.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId} params.ticketId
 * @param {string} params.ticketType - e.g. 'toilet', 'parking'
 * @param {Date} [params.exitTime] - Optional exitTime override
 * @param {mongoose.ClientSession} session - Mongoose session
 */
async function updateTicketStatus(
  { billId, finalAmount, exitTime = new Date(), paymentType },
  session
) {
  const { autoComplete } = getTicketUpdateFlags(paymentType);

  const ticket = await Ticket.findOne({ billId }).session(session);
  if (!ticket && autoComplete) throw new Error("Ticket not found");


  const update = {
    ...(autoComplete && { status: "checked-out", exitTime }),
  };

  if (Object.keys(update).length === 0) return;

  await Promise.all([
    Bill.findByIdAndUpdate(
      billId,
      {
        $set: { amount: finalAmount, outstandingAmount: finalAmount },
      },
      { session }
    ),
    Ticket.findByIdAndUpdate(ticket._id, update, { session }),
  ]);

  return autoComplete;
}

module.exports = { getTicketUpdateFlags, updateTicketStatus };
