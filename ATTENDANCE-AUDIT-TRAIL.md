# Attendance Audit Trail - Access Control

## Overview
The attendance audit trail is restricted to **Admin** and **Super Admin** roles only. Regular staff members cannot view the audit trail, but their attendance is still tracked automatically.

## Access Control

### Who Can Access?
✅ **Admin** - Full access to attendance audit trail
✅ **Super Admin** - Full access to attendance audit trail

### Who Cannot Access?
❌ **Manager** - Cannot view audit trail
❌ **Stock Clerk** - Cannot view audit trail
❌ **Cashier** - Cannot view audit trail

## How It Works

### For Regular Staff (Non-Admins)
1. Attendance is **automatically tracked** when they:
   - Log in to the system (auto check-in)
   - Log out of the system (auto check-out)
2. They **cannot view** the attendance page
3. They see an "Access Restricted" message if they try to access it
4. Their attendance data is still recorded in the database

### For Admins & Super Admins
1. Can access the "Attendance Audit" page from the sidebar
2. Can view full attendance history for all staff
3. Can see check-in/check-out times
4. Can view hours worked and overtime
5. Can monitor staff attendance patterns

## Implementation

### Frontend Access Control

#### Sidebar Navigation
Only Admin and Super Admin see the "Attendance Audit" menu item:
```typescript
{(isAdmin || isSuperAdmin) && (
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={isActive("/dashboard/attendance")}>
      <Link href="/dashboard/attendance">
        <Clock />
        <span>Attendance Audit</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

#### Page Access Control
The attendance page checks user role:
```typescript
const isAdmin = user?.role === "admin" || user?.role === "superAdmin";

if (!isAdmin) {
  return <AccessDeniedMessage />;
}
```

### Backend Access Control
The API endpoints have role-based middleware:
- `/api/attendance` - Requires admin role
- `/api/attendance/all` - Requires admin role
- `/api/attendance/summary` - Requires admin role

## User Experience

### For Regular Staff
When they navigate to `/dashboard/attendance`, they see:
```
🚫 Access Restricted

Only administrators can view the attendance audit trail.
Your attendance is tracked automatically when you log in and out.
```

### For Admins
They see the full attendance interface:
- Check-in/Check-out history
- Hours worked tracking
- Overtime calculations
- All staff attendance data

## Benefits

✅ **Security** - Only authorized personnel can view sensitive attendance data
✅ **Privacy** - Staff attendance data is protected
✅ **Compliance** - Meets data protection requirements
✅ **Audit** - Admins can monitor staff attendance
✅ **Transparency** - Regular staff know their attendance is tracked but can't see details

## Security Notes

1. **Role-Based Access** - Implemented at both frontend and backend
2. **Automatic Tracking** - All staff attendance is tracked regardless of access
3. **No Manual Override** - Regular staff cannot bypass the access restriction
4. **Audit Log** - All access attempts are logged

## Future Enhancements

- Allow managers to view their team's attendance
- Add permission to view own attendance (current day)
- Export attendance data for payroll
- Schedule reports and email notifications
