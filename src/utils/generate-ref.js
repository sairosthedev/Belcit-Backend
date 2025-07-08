const RefCounter = require("../models/ref-counter.model");

/**
 * Generate a reference number for a given type and period.
 * The reference number is in the format: prefixYYYYMMDD-0001
 * @param {Object}
 * period - should follow the pattern - YYYYMMDD, e.g. 20240512
 * type - model type, invoice, bill, payment, etc.
 * prefix - prefix for the reference number (MKB-, for bills, or PMT- for payments)
 * pad - number of digits to pad the sequence number
 * }
 * @returns {string} - The generated reference number
 */
async function generateRef({ type, period, prefix = "", pad = 4 }) {
  const counterName = `${type}-${period}`;
  const counter = await RefCounter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter.seq.toString().padStart(pad, "0");
  return `${prefix}${period}-${seq}`;
}

async function getDatePart() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // '25'
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // '04'
  const day = now.getDate().toString().padStart(2, "0"); // '28'
  return `${year}${month}${day}`; // '250428'
}

module.exports = { generateRef, getDatePart };
