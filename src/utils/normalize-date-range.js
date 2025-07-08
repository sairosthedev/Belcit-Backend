function normalizeDateRange(startDate, endDate) {
  let start = null;
  if (startDate) {
    start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0); // 00:00:00.000Z
  }

  let end = null;
  if (endDate) {
    end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999); // 23:59:59.999Z
  }
  return { start, end };
}

module.exports = normalizeDateRange;
