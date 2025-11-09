# Story 1.3 Quick Start Guide

## Getting Started with Employee Management

### Prerequisites
- HR Admin role assigned to your user account
- Access to the application at `/admin/users`

### Quick Test (5 minutes)

#### 1. View Employee Directory
1. Login with HR Admin credentials
2. Navigate to **Admin** → **Users**
3. See all employees displayed in a table

#### 2. Search for Employees
1. Use the search bar at the top
2. Type any part of an employee's name, email, or ID
3. Results filter in real-time

#### 3. Filter by Department
1. Use the department dropdown
2. Select a department
3. See only employees from that department

#### 4. Import Sample Data
1. Click **"Import Users"** button
2. Click **"Download CSV Template"** to see the format
3. Upload the sample file at `data/employee-import-sample.csv`
4. Review the preview
5. Click **"Import Employees"**
6. Check the results

#### 5. Create a New Employee
1. Click **"Create User"**
2. Fill in the required fields:
   - Full Name: `Test Employee`
   - Email: `test@example.com`
   - Employee ID: `TEST001`
   - Password: `TempPass123!`
   - Grade: `Junior`
   - Department: `Engineering`
3. Check the **"employee"** role
4. Click **"Create"**

#### 6. Edit an Employee
1. Find the employee you just created
2. Click **"Edit"** in their row
3. Change the Grade to `Senior`
4. Click **"Update"**

#### 7. Test Auto-Population (Developer)
```tsx
import EmployeeAutoPopulate from '@/components/admin/EmployeeAutoPopulate'

function MyForm() {
  return (
    <EmployeeAutoPopulate
      onEmployeeSelected={(emp) => console.log(emp)}
      label="Employee ID"
      required
    />
  )
}
```

### CSV Import Format

**Required columns:**
```csv
employeeId,fullName,email,grade,department
EMP001,John Doe,john@company.com,Senior,Engineering
```

**With optional columns:**
```csv
employeeId,fullName,email,grade,department,jobTitle,employmentStatus,managerId,roles
EMP001,John Doe,john@company.com,Senior,Engineering,Senior Engineer,active,,employee
EMP002,Jane Smith,jane@company.com,Principal,Engineering,Principal Engineer,active,,employee,manager
```

### Common Issues

**Problem:** Can't access `/admin/users`
- **Solution:** Ensure your user has the `hr_admin` role

**Problem:** Import fails with "already exists"
- **Solution:** Check for duplicate employee IDs or emails in your CSV

**Problem:** Search not working
- **Solution:** Make sure you're typing in the search box, results filter automatically

**Problem:** Can't edit email
- **Solution:** Email is read-only after creation (security feature)

### API Testing with curl

**Lookup an employee:**
```bash
curl -X GET http://localhost:3000/api/users/EMP001 \
  -H "Cookie: your-session-cookie"
```

**Import employees:**
```bash
curl -X POST http://localhost:3000/api/users/import \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"employees": [{"employeeId":"EMP999","fullName":"Test User","email":"test@example.com","grade":"Junior","department":"IT"}]}'
```

### Running Tests

**Unit tests:**
```bash
npm run test:unit
```

**Specific test files:**
```bash
npx vitest tests/unit/employee-import.test.ts
npx vitest tests/unit/employee-lookup.test.ts
```

**E2E tests:**
```bash
npm run test:e2e tests/e2e/employee-management.spec.ts
```

### Next Steps

1. Import your actual employee data using CSV
2. Verify all employees appear correctly
3. Test search and filter with your data
4. Integrate `EmployeeAutoPopulate` component into target setting forms
5. Integrate `EmployeeAutoPopulate` component into evaluation forms

### Documentation

- Full feature guide: [docs/employee-management-guide.md](../employee-management-guide.md)
- Implementation details: [docs/stories/1-3-implementation-summary.md](./1-3-implementation-summary.md)
- Story details: [docs/stories/1-3-employee-data-management.md](./1-3-employee-data-management.md)

### Support

For issues or questions:
1. Check the error message in the UI
2. Review browser console for detailed errors
3. Check server logs for API errors
4. Refer to the comprehensive guide at `docs/employee-management-guide.md`
