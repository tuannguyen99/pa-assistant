# Employee Management Guide

## Overview

The Employee Management system allows HR Admins to import, manage, and maintain employee records in the PA Assistant system. This guide covers all features implemented in Story 1.3.

## Features

### 1. Employee Directory

**Access:** Navigate to `/admin/users` (HR Admin role required)

The employee directory displays all employees in the system with the following information:
- Employee ID
- Full Name
- Email
- Roles
- Grade
- Department

#### Search and Filter

- **Search Bar:** Search by name, email, or employee ID
- **Department Filter:** Filter employees by department using the dropdown
- **Clear Filters:** Remove all active filters with one click

### 2. Manual Employee Management

#### Creating a New Employee

1. Click **"Create User"** button
2. Fill in the required fields:
   - Full Name *
   - Email *
   - Employee ID * (unique identifier)
   - Password * (minimum 6 characters)
   - Grade
   - Department
3. Select at least one role (checkbox selection)
4. Click **"Create"** to save

#### Editing an Employee

1. Find the employee in the directory
2. Click the **"Edit"** button in their row
3. Update the desired fields
4. Password is optional (leave blank to keep current password)
5. Click **"Update"** to save changes

**Note:** Email addresses cannot be changed after creation.

### 3. CSV Import

**Access:** Click **"Import Users"** from the user management page or navigate to `/admin/users/import`

#### CSV Format

Download the template by clicking **"Download CSV Template"** on the import page.

##### Required Columns
- `employeeId` - Unique employee identifier
- `fullName` - Employee's full name
- `email` - Valid email address (must be unique)
- `grade` - Employee grade/level
- `department` - Department name

##### Optional Columns
- `jobTitle` - Job title
- `employmentStatus` - Status: `active`, `inactive`, or `on_leave` (default: `active`)
- `managerId` - Database ID of the employee's manager
- `roles` - Comma-separated role list (e.g., `employee,manager`)

#### Import Process

1. **Prepare CSV File**
   - Use the template as a guide
   - Ensure all required columns are present
   - Use comma-separated values for multiple roles

2. **Upload File**
   - Click **"Select CSV File"**
   - Choose your `.csv` file
   - The system will parse and preview the data

3. **Review Preview**
   - Check that all data appears correctly
   - Verify employee IDs and emails are unique
   - Review the number of employees to be imported

4. **Import**
   - Click **"Import Employees"**
   - Wait for the import process to complete
   - Review the results

#### Import Results

After import, you'll see:
- **Success count:** Number of employees successfully imported
- **Failed count:** Number of employees that failed to import
- **Error details:** Specific errors for each failed row

Common import errors:
- Duplicate employee ID
- Duplicate email address
- Invalid email format
- Missing required fields
- Invalid manager ID reference

#### Default Settings

- **Default Password:** Set to the employee's `employeeId`
- **Default Role:** `employee` (if not specified)
- **Auth Provider:** `credentials`

### 4. Auto-Population Component

The `EmployeeAutoPopulate` component enables quick employee lookup for forms.

#### Usage

```tsx
import EmployeeAutoPopulate from '@/components/admin/EmployeeAutoPopulate'

function MyForm() {
  const handleEmployeeSelected = (employee) => {
    // Use employee data to populate form fields
    console.log(employee.fullName)
    console.log(employee.department)
  }

  return (
    <EmployeeAutoPopulate
      onEmployeeSelected={handleEmployeeSelected}
      label="Employee ID"
      required={true}
    />
  )
}
```

#### Component Features

- Type employee ID and press "Lookup" or blur the field
- Displays employee details if found:
  - Name
  - Email
  - Grade
  - Department
  - Job Title (if available)
  - Manager (if available)
- Shows error message if employee not found
- Calls `onEmployeeSelected` callback with full employee object

### 5. API Endpoints

#### Import Employees
```
POST /api/users/import
Content-Type: application/json

{
  "employees": [
    {
      "employeeId": "EMP001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "grade": "Senior",
      "department": "Engineering",
      "jobTitle": "Senior Engineer",
      "employmentStatus": "active",
      "managerId": "uuid-or-null",
      "roles": ["employee"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "imported": 1,
  "failed": 0,
  "errors": []
}
```

#### Lookup Employee
```
GET /api/users/[id]
```

Supports lookup by:
- Employee ID (e.g., `EMP001`)
- Database UUID

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "employeeId": "EMP001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "grade": "Senior",
    "department": "Engineering",
    "jobTitle": "Senior Engineer",
    "employmentStatus": "active",
    "managerId": "uuid",
    "manager": {
      "id": "uuid",
      "fullName": "Jane Manager",
      "employeeId": "MGR001"
    },
    "roles": ["employee"]
  }
}
```

## Security

- All endpoints require authentication
- Import and user management require **HR Admin** role
- Employee lookup available to all authenticated users
- Passwords are hashed using bcrypt (12 salt rounds)

## Testing

### Manual Testing

1. **Test CSV Import:**
   - Use the sample file at `data/employee-import-sample.csv`
   - Try importing with duplicate employee IDs (should fail gracefully)
   - Try importing with invalid emails (should show validation errors)

2. **Test Search/Filter:**
   - Create multiple employees in different departments
   - Search by various criteria
   - Test department filter

3. **Test Auto-Population:**
   - Use the lookup API endpoint
   - Try both valid and invalid employee IDs
   - Verify all fields populate correctly

### Automated Testing

Run unit tests:
```bash
npm run test:unit
```

Run E2E tests:
```bash
npm run test:e2e
```

Specific test files:
- `tests/unit/employee-import.test.ts` - Import validation and processing
- `tests/unit/employee-lookup.test.ts` - Lookup API tests
- `tests/e2e/employee-management.spec.ts` - Full employee management flows

## Troubleshooting

### Import Issues

**Problem:** CSV file not accepted
- **Solution:** Ensure file has `.csv` extension and proper formatting

**Problem:** "Missing required columns" error
- **Solution:** Verify CSV has all required columns: employeeId, fullName, email, grade, department

**Problem:** Multiple employees fail with "already exists"
- **Solution:** Check for duplicate employee IDs or emails in your CSV file

### Search Not Working

**Problem:** Search doesn't show expected results
- **Solution:** Search is case-insensitive; check spelling and try partial matches

### Auto-Population Not Working

**Problem:** Employee not found
- **Solution:** Verify the employee ID exists in the system; check for spaces or special characters

## Future Enhancements

Planned for upcoming stories:
- Integration with LDAP/Active Directory
- Bulk edit functionality
- Advanced filtering (by role, status, grade)
- Employee profile pages
- Manager hierarchy visualization
- Audit trail for employee changes
- Export employee data

## Related Documentation

- [Story 1.3: Employee Data Management](./stories/1-3-employee-data-management.md)
- [RBAC Specification](./rbac-spec.md)
- [Data Architecture](./architecture/data-architecture.md)
- [Testing Strategy](./architecture/testing-strategy.md)
