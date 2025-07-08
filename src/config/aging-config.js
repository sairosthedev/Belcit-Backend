// config/aging.js
const AGING_CONFIG = {
    parking: {
      isDynamic: true,      // needs exit time + grace
      period: 0             // base period (used if fallback)
    },
    rent: {
      isDynamic: false,     // static aging
      period: 7             // days after invoice
    },
    fine: {
      isDynamic: false,
      period: 0             // instant payment
    },
    toilet: {
      isDynamic: false,
      period: 0
    }
  };
  
  module.exports = AGING_CONFIG;
  