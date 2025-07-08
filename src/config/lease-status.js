const LEASE_STATUSES = ["offer", "active", "expired", "rejected", "terminated"];
const LEASE_STATUSES_ENUM = {
  OFFER: "offer",
  ACTIVE: "active",
  EXPIRED: "expired",
  TERMINATED: "terminated",
};

module.exports = { LEASE_STATUSES, LEASE_STATUSES_ENUM };
