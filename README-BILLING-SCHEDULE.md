# Billing Schedule Functionality

This document explains the implementation of the billing schedule functionality in the Mbare-Mkambo-Backend system.

## Overview

The billing schedule system allows for automatic generation of bills based on configured frequencies and dates. It supports various billing frequencies including weekly, fortnightly, monthly, quarterly, biannually, and yearly.

## Key Features

1. **Frequency-based billing**: Configure billing to occur at various intervals
2. **Day-specific scheduling**: 
   - For weekly/fortnightly: Specify day of week (1-7, Monday-Sunday)
   - For monthly+: Specify day of month (1-31)
3. **Automated execution**: Cron job runs every 2 hours between 6am and 12noon
4. **Invoice template integration**: Associate billing schedules with invoice templates

## Implementation Details

### Billing Frequency Structure

```javascript
{
  onDate: Number,     // 1-7 for weekly/fortnightly (day of week), 1-31 for others (day of month)
  frequency: String,  // "weekly", "fortnightly", "monthly", "quarterly", "biannually", "yearly"
  occurrence: Number  // Default 1, how many frequency units to add for each billing cycle
}
```

### Date Calculation Logic

- **Weekly**: Find the next occurrence of the specified day of week, then add 7 days × occurrence
- **Fortnightly**: Find the next occurrence of the specified day of week, then add 14 days × occurrence
- **Monthly**: Add the specified number of months, maintaining the same day of month where possible
- **Quarterly**: Add 3 months × occurrence
- **Biannually**: Add 6 months × occurrence
- **Yearly**: Add 1 year × occurrence

### Key Files

1. **src/models/billing-schedule.model.js**: Schema definition with validation
2. **src/utils/calculate-next-billing-date.js**: Date calculation functions
3. **src/controllers/tickets/billing-schedule.controller.js**: Business logic
4. **src/routes/billing-schedule.routes.js**: API endpoints
5. **src/utils/billing-schedule-cron.js**: Automated execution configuration
6. **src/app.js**: Cron job integration

### API Endpoints

- `POST /api/billing-schedules`: Create a new billing schedule
- `GET /api/billing-schedules`: Get all billing schedules
- `GET /api/billing-schedules/:id`: Get a specific billing schedule
- `PUT /api/billing-schedules/:id`: Update a billing schedule
- `POST /api/billing-schedules/run`: Manually trigger the billing process

### Cron Schedule

The system runs the billing schedule every 2 hours between 6am and 12noon (at 6am, 8am, 10am, and 12noon) using the cron pattern: `0 6,8,10,12 * * *`

## Usage Examples

### Creating a Weekly Billing Schedule (Every Monday)

```javascript
{
  "description": "Weekly Rental Payment",
  "billingFrequency": {
    "onDate": 1,  // Monday
    "frequency": "weekly",
    "occurrence": 1
  },
  "startDate": "2025-06-01T00:00:00.000Z",
  "isActive": true
}
```

### Creating a Monthly Billing Schedule (15th of each month)

```javascript
{
  "description": "Monthly Rental Payment",
  "billingFrequency": {
    "onDate": 15,  // 15th of month
    "frequency": "monthly",
    "occurrence": 1
  },
  "startDate": "2025-06-01T00:00:00.000Z",
  "isActive": true
}
```

## Handling Edge Cases

- If the specified day of month does not exist (e.g., 31st in a 30-day month), the last day of the month is used
- For weekly/fortnightly frequencies, if the current day is after the specified day of week, it moves to the next week
- Inactive schedules are skipped during automatic runs

