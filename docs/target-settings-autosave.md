# Target Settings Auto-Save Implementation

## Overview

This implementation adds comprehensive auto-save and change tracking functionality to the target settings form, ensuring data safety and providing clear user feedback.

## Implemented Requirements

### 1.  Change Tracking

The form tracks changes to all specified fields:
- Current Role
- Long-term Goal
- Each Dimension/Task
- Each Target (KPI)
- Each Weight
- Each Difficulty

**Implementation:**
- Uses `useWatch` from react-hook-form to monitor all form fields
- Compares current state with last saved state using JSON serialization
- Tracks both form dirty state and actual data changes

### 2.  Save Draft Button State Management

**Enabled when:**
- Any tracked field has unsaved changes (form is "dirty")
- Not currently performing an auto-save or manual save operation

**Disabled when:**
- No changes have been made
- Save operation is in progress
- After successful save (automatically re-enables when changes are made)

### 3.  Auto-Save Functionality

**Features:**
- **3-second debounce**: Auto-save triggers 3 seconds after the last change
- **Clear notifications**: Toast notifications show:
  - "Auto-saving draft..." (loading state)
  - " Draft auto-saved successfully" (success - 3s duration)
  - "Failed to auto-save draft. Please try manual save." (error - 5s duration)
- **Save Draft button disabled**: Automatically disabled after auto-save completes
- **Visual indicator**: Small "Auto-saving..." text with spinner appears in the workflow header during save

### 4.  Manual Save with Notifications

**Features:**
- Clear loading state with spinner: "Saving..."
- Success notification: " Draft saved successfully" (3s duration)
- Error notification: Shows specific error message (5s duration)
- Button disabled during save operation

### 5.  Unsaved Changes Warning

**Protection on:**
- Page reload (browser beforeunload event)
- Navigation to other pages (custom hook)

**Implementation:**
- Custom `useUnsavedChangesWarning` hook
- Shows browser confirm dialog: "You have unsaved changes in your target settings. Do you want to leave without saving?"
- Only activates when there are actual unsaved changes

### 6.  Data Persistence on Page Reload

- Page always loads latest data from database on mount
- Save Draft button starts in disabled state (no changes yet)
- Form state resets after successful save

### 7.  Notification System

**Technology:** Sonner (modern, lightweight toast library)

**Features:**
- Top-right placement
- Rich colors for different states
- Close button on all toasts
- 4-second default duration
- Loading states with proper transitions
- Clear success/error indicators ( and )

### 8.  Performance & Concurrency Testing

**Load Test Script:** `tests/load/target-save-load-test.js`

**Test Parameters:**
- 200 concurrent users
- 5 saves per user
- Total: 1,000 requests

**Metrics Tracked:**
- Success rate
- Error rate
- Average response time
- Min/Max response times
- Requests per second

**Run Test:**
```bash
# Start your development server
npm run dev

# In another terminal, run the load test
node tests/load/target-save-load-test.js
```

**Database Optimizations:**
- Prisma handles concurrent writes safely
- Unique constraints on employeeId + cycleYear prevent duplicates
- Transaction support ensures data integrity
- Audit logging tracks all changes

## Technical Implementation Details

### Key Components

1. **TargetSettingForm.tsx**
   - Main form component with all auto-save logic
   - Uses react-hook-form for form management
   - Custom change detection logic
   - Toast notifications for all save operations

2. **use-unsaved-changes-warning.ts**
   - Custom hook for preventing data loss
   - Handles browser beforeunload events
   - Provides navigation confirmation function

3. **Toaster (sonner)**
   - Integrated in root layout
   - Configured for top-right placement with rich colors

### State Management

```typescript
// Track save state
const [isSaving, setIsSaving] = useState(false)

// Track last saved data for comparison
const [lastSavedData, setLastSavedData] = useState<string>('')

// Check for unsaved changes
const hasUnsavedChanges = useCallback(() => {
  const currentData = JSON.stringify({ targets, currentRole, longTermGoal })
  return isDirty || (currentData !== lastSavedData && lastSavedData !== '')
}, [isDirty, targets, currentRole, longTermGoal, lastSavedData])
```

### Auto-Save Logic

```typescript
useEffect(() => {
  if (!onSaveDraft || !hasUnsavedChanges() || isSaving) return

  const timer = setTimeout(async () => {
    setIsSaving(true)
    const toastId = toast.loading('Auto-saving draft...')
    
    try {
      await onSaveDraft(currentData)
      setLastSavedData(JSON.stringify(currentData))
      reset(currentData) // Clear dirty state
      toast.success(' Draft auto-saved successfully', { id: toastId })
    } catch (error) {
      toast.error('Failed to auto-save draft', { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }, 3000)

  return () => clearTimeout(timer)
}, [hasUnsavedChanges, isSaving, ...watchedFields])
```

## API Endpoints

### PUT /api/targets/[id]

**Features:**
- Handles both manual and auto-save requests
- Supports draft validation (relaxed) vs. submission validation (strict)
- Updates database atomically
- Creates audit log entries
- Returns updated target setting with parsed JSON

**Error Handling:**
- 401: Unauthorized
- 404: Target setting not found
- 409: Cannot update in current status
- 400: Validation errors
- 500: Server errors

## Testing Instructions

### Manual Testing

1. **Change Tracking:**
   - Open target settings page
   - Notice "Save Draft" button is disabled
   - Make any change to a field
   - Button should enable immediately

2. **Auto-Save:**
   - Make a change and wait 3 seconds
   - Should see "Auto-saving..." indicator
   - Toast notification should appear
   - Button should disable after save

3. **Manual Save:**
   - Make changes
   - Click "Save Draft" before 3 seconds
   - Should see loading state and success notification

4. **Unsaved Changes Warning:**
   - Make changes without saving
   - Try to reload page or navigate away
   - Should see confirmation dialog

5. **Error Handling:**
   - Disconnect network
   - Try to save
   - Should see clear error message

### Load Testing

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Run load test
node tests/load/target-save-load-test.js

# Expected output:
#  TEST PASSED: All requests completed successfully!
# Success rate should be 99%+
```

## Browser Compatibility

-  Chrome/Edge (latest)
-  Firefox (latest)
-  Safari (latest)
-  Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

1. **Debouncing:** 3-second delay prevents excessive API calls
2. **Optimistic Updates:** Form state updates immediately, save happens in background
3. **Minimal Re-renders:** Uses `useCallback` and careful dependency arrays
4. **Efficient Change Detection:** JSON serialization only on form changes
5. **Database Optimization:** Indexed queries, proper transactions

## Security

-  Authentication required for all save operations
-  User can only save their own targets
-  Audit logging tracks all changes
-  Input validation on both client and server
-  SQL injection prevention (Prisma ORM)

## Known Limitations

1. **Offline Support:** No offline storage (requires network connection)
2. **Conflict Resolution:** Last write wins (no merge conflict detection)
3. **Maximum Field Lengths:** Enforced by schema validation

## Future Enhancements

1. **Real-time Collaboration:** Show when manager is viewing
2. **Version History:** View previous saved versions
3. **Offline Support:** IndexedDB for offline editing
4. **Smart Conflict Resolution:** Detect and resolve merge conflicts
5. **AI Suggestions:** Auto-complete KPIs based on role and department

## Dependencies

- `sonner`: ^1.x - Toast notifications
- `react-hook-form`: ^7.x - Form management
- `@tanstack/react-query`: ^5.x - (future: optimistic updates)

## Files Modified/Created

### Created:
- `src/hooks/use-unsaved-changes-warning.ts`
- `tests/load/target-save-load-test.js`
- `docs/target-settings-autosave.md` (this file)

### Modified:
- `src/app/layout.tsx` - Added Toaster component
- `src/components/targets/TargetSettingForm.tsx` - Full rewrite with auto-save
- `src/app/(dashboard)/targets/new/TargetCreationClient.tsx` - Toast integration
- `package.json` - Added sonner dependency

## Support

For issues or questions, please:
1. Check this documentation
2. Review the inline code comments
3. Run the load test to verify performance
4. Check browser console for detailed error messages

---

**Implementation Date:** November 11, 2025
**Version:** 1.0.0
**Status:**  Complete - All 8 requirements implemented and tested
