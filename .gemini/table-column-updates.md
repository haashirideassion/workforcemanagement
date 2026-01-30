# Table Column Updates - Summary

## Changes Made

### 1. ✅ Utilization Page (`src/pages/Utilization.tsx`)
**Removed Entity Column from the table**

**Before:**
- Table columns: Employee | Entity | Projects | Utilization | Status

**After:**
- Table columns: Employee | Projects | Utilization | Status

**Changes:**
- Removed `<TableHead>Entity</TableHead>` from table header (line 130)
- Removed Entity `<TableCell>` with Badge from table body rows (lines 142-146)

The Entity filter pills at the top of the page (All Entities, ITA, IBCC, IITT) remain functional for filtering the data.

---

### 2. ✅ Employees Page (`src/pages/Employees.tsx`)
**Added Entity Column to the table**

**Before:**
- Table columns: Name | Type | Project | Utilization | Status | Actions

**After:**
- Table columns: Name | Entity | Type | Project | Utilization | Status | Actions

**Changes:**
- Added `<TableHead>Entity</TableHead>` to table header (after Name column)
- Added Entity `<TableCell>` with Badge displaying `employee.entity?.name` in table body rows

The Entity column displays the entity name (ITS, IBCC, or IITT) as an outlined badge for each employee.

---

## Visual Changes

### Utilization Screen
- Cleaner table layout with one less column
- Entity information is still accessible via the filter pills at the top
- More space for other important columns (Projects, Utilization, Status)

### Employees Screen
- Entity information now visible directly in the table
- Easier to see which entity each employee belongs to at a glance
- Entity displayed as a badge for visual consistency with other parts of the app

---

## Files Modified
1. `src/pages/Utilization.tsx` - Removed Entity column
2. `src/pages/Employees.tsx` - Added Entity column

Both changes are now live and should be visible in your running application.
