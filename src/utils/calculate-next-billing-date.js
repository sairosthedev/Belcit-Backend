function calculateNextBillingDate(current, frequency, occurrence) {
  const next = new Date(current);
  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7 * occurrence);
      break;
    case "fortnightly":
      next.setDate(next.getDate() + 14 * occurrence);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + occurrence);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3 * occurrence);
      break;
    case "biannually":
      next.setMonth(next.getMonth() + 6 * occurrence);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + occurrence);
      break;
  }
  return next;
}

function getInitialNextBillingDate({
  startDate,
  onDate,
  frequency = "monthly",
  endDate = null,
}) {
  const toDate = (input) => new Date(input);
  const cloneDate = (date) => new Date(date.getTime());

  startDate = toDate(startDate);
  if (endDate) endDate = toDate(endDate);

  const isPastEndDate = (date) =>
    endDate && new Date(date).getTime() > endDate.getTime();

  // Align to target weekday
  const alignToWeekday = (baseDate, targetWeekday) => {
    const date = cloneDate(baseDate);
    const currentDay = date.getDay();
    const diff = (7 + targetWeekday - currentDay) % 7 || 7;
    date.setDate(date.getDate() + diff);
    return date;
  };

  let nextDate;

  if (["weekly", "fortnightly"].includes(frequency)) {
    const stepDays = frequency === "weekly" ? 7 : 14;

    // Anchor weekday is based on the weekday of the `onDate` from startDate
    const anchor = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      onDate
    );
    const targetWeekday = anchor.getDay();
    nextDate = alignToWeekday(startDate, targetWeekday);

    // Ensure it's in the future
    if (nextDate <= new Date()) {
      nextDate.setDate(nextDate.getDate() + stepDays);
    }
  } else {
    // Monthly, Quarterly, Yearly
    const stepBy = {
      monthly: 1,
      quarterly: 3,
      biannually: 6,
      yearly: 12,
    };

    const monthsToAdd = stepBy[frequency.toLowerCase()];
    if (!monthsToAdd) throw new Error("Unsupported frequency");

    nextDate = new Date(startDate);
    if (nextDate.getDate() > onDate) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    nextDate.setDate(onDate);

    // Ensure it's in the future
    if (nextDate <= new Date()) {
      nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
    }
  }

  if (isPastEndDate(nextDate)) return null;

  return nextDate;
}

module.exports = {
  calculateNextBillingDate,
  getInitialNextBillingDate,
};
