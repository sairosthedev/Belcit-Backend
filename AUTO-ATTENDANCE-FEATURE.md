# Automatic Attendance Tracking

## Overview
The system now automatically tracks staff attendance when they log in and out of the application.

## How It Works

### Automatic Check-In
When a staff member logs in:
1. User credentials are verified
2. JWT token is received and stored
3. User profile is fetched
4. **Automatically checks in to the attendance system**
5. Check-in time is recorded in the database

### Automatic Check-Out
When a staff member logs out:
1. **Automatically checks out from the attendance system**
2. Check-out time is recorded
3. Hours worked and overtime are calculated
4. Session is terminated (token removed)

## Implementation Details

### Frontend (`hooks/use-auth.tsx`)
```typescript
// In login function
await apiFetch('/api/attendance/checkin', {
  method: 'POST',
  body: JSON.stringify({ staffId: user._id }),
});

// In logout function
await apiFetch('/api/attendance/checkout', {
  method: 'POST',
  body: JSON.stringify({ staffId: user._id }),
});
```

### Backend
- Uses existing `/api/attendance/checkin` and `/api/attendance/checkout` endpoints
- Handles duplicate check-ins (prevents multiple check-ins on same day)
- Calculates hours worked and overtime automatically

## Benefits

✅ **Seamless Tracking** - No manual intervention needed
✅ **Accurate Records** - Automatic timestamp logging
✅ **Time Calculations** - Automatic hours worked and overtime calculation
✅ **Error Handling** - Login/logout doesn't fail if attendance fails
✅ **Audit Trail** - Complete record of staff presence

## Error Handling

The system gracefully handles attendance failures:
- If check-in fails, login still succeeds
- If check-out fails, logout still succeeds
- Errors are logged to console for debugging
- Staff can still access the system even if attendance tracking fails

## Manual Override

Staff can still manually check in/out on the Attendance page if needed:
- Useful for corrections
- Allows for manual adjustments
- Provides flexibility for special cases

## Attendance Records

Each attendance record includes:
- **Date** - Date of attendance
- **Check-In Time** - When user logged in
- **Check-Out Time** - When user logged out (if applicable)
- **Hours Worked** - Total hours for the day
- **Overtime** - Any overtime hours
- **Status** - present/absent/late/half-day/leave

## Future Enhancements

- Real-time notifications for missed check-ins
- Automatic alerts for unusual patterns
- Integration with payroll systems
- Location-based check-in/out (GPS)
- Mobile app push notifications
