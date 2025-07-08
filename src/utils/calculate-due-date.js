async function calculateDueDateFromChargeType(chargeTypeDoc, context = {}) {
    if (chargeTypeDoc.isDynamicAging) {
      if (chargeTypeDoc.key === 'parking' && context.exitTime) {
        const grace = chargeTypeDoc.metadata?.graceMinutes || 0;
        return new Date(new Date(context.exitTime).getTime() + grace * 60 * 1000);
      }
      // fallback
      return new Date();
    }
  
    return new Date(Date.now() + chargeTypeDoc.defaultPeriod * 86400000);
  }
  