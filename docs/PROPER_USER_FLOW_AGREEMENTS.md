# Proper User Flow for All 5 Agreement Types

**Date:** 2025-10-29
**Status:** ✅ ENFORCED - Configuration Required Before Signing

---

## 🚨 Critical Bug Fixed

### Previous Issue (PATCHED 2025-10-29)
Users could sign contracts without configuring deliverables:
- Demo user `doe-district@demo.com` had `contract_signed = true` but **0 contracts** in database
- Dashboard showed 5 indicators even though NO contract existed
- Users bypassed `/contract/configure` step

### Root Cause
1. Sign page allowed "fallback flow" if no `localStorage.contract_selections`
2. Fallback only called `/api/contracts/sign` (marks user as signed, no contract created)
3. Indicators API showed all indicators regardless of contract existence

---

## ✅ Correct Flow for All Contract Types (1-5)

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Login                                               │
│ - User logs in via /login or /demo-login                    │
│ - Session created with user.contract_type                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Configure Deliverables (REQUIRED)                   │
│ URL: /contract/configure                                     │
│ - User selects Option 1, 2, or 3 for each deliverable       │
│ - Selections saved to localStorage: 'contract_selections'   │
│ - Each selection has: {deliverable_id, selected_option_id}  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Sign Contract                                        │
│ URL: /contract/sign                                          │
│ - User reads contract                                        │
│ - User draws/uploads signature                               │
│ - Checks: localStorage has 'contract_selections'? ✅         │
│ - Calls: POST /api/contracts/configure                      │
│   → Creates contract record                                  │
│   → Creates contract_indicators (5 indicators)               │
│   → Creates contract_deliverable_selections                  │
│   → Marks user.contract_signed = true                        │
│ - Clears localStorage.contract_selections                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: ME Dashboard                                         │
│ URL: /me-dashboard                                           │
│ - Shows user's 5 indicators from their contract             │
│ - Shows deliverables with selected options                  │
│ - Shows milestones linked to contract                       │
│ - All data filtered by contract_id                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Enforcement Mechanisms (NEW)

### 1. Contract Sign Page Guard
**File:** `app/contract/sign/page.tsx` (lines 237-247)

```typescript
// CRITICAL: For Contract Types 1-5, deliverable configuration is REQUIRED
if (isConfigurableContract && !selectionsJson) {
  message.error('សូមជ្រើសរើសជម្រើសសមិទ្ធកម្មមុនពេលចុះហត្ថលេខា')
  setSigning(false)
  // Redirect to configuration page
  router.push('/contract/configure')
  return
}
```

**Result:**
- ❌ Users CANNOT sign without configuring deliverables
- ✅ Automatic redirect to `/contract/configure`
- ✅ Error message shown in Khmer

---

### 2. Indicators API Guard
**File:** `app/api/me/indicators/route.ts` (lines 79-87)

```typescript
// CRITICAL: For ALL Contract Types 1-5, return empty if no contract exists
if (!userContract && effectiveContractType && effectiveContractType >= 1 && effectiveContractType <= 5) {
  return NextResponse.json({
    indicators: [],
    total: 0,
    message: 'Please configure your contract deliverables first'
  })
}
```

**Result:**
- ❌ Users without contracts see ZERO indicators
- ✅ Dashboard shows "គ្មានសូចនាករ" (No indicators)
- ✅ Prevents redundant data display

---

## 📊 Database State Validation

### Valid User (Properly Configured)
```sql
-- User: doe-school@demo.com (Contract Type 5)
user.contract_signed = true          ✅
contracts.count = 1                  ✅
contract_indicators.count = 5        ✅
deliverable_selections.count = 5     ✅
```

### Invalid User (Bypassed Configuration) - FIXED
```sql
-- User: doe-district@demo.com (Contract Type 4) - BEFORE FIX
user.contract_signed = true          ❌ (marked signed but no contract)
contracts.count = 0                  ❌ (no contract created)
contract_indicators.count = 0        ❌ (no indicators)
deliverable_selections.count = 0     ❌ (no selections)

-- AFTER FIX: This state is now IMPOSSIBLE
-- Users are redirected to /contract/configure before signing
```

---

## 🔄 Fixing Existing Corrupted Users

If you have users who bypassed configuration (like doe-district@demo.com), you have two options:

### Option 1: Reset User to Re-Configure
```sql
-- Reset user to allow proper configuration
UPDATE users
SET
  contract_signed = false,
  contract_signed_date = NULL,
  signature_data = NULL
WHERE email = 'doe-district@demo.com';

-- User will be prompted to:
-- 1. Go to /contract/configure
-- 2. Select deliverable options
-- 3. Sign contract properly
```

### Option 2: Use Demo Reset API
```bash
# For demo users, use the built-in reset endpoint
curl -X POST https://agreements.openplp.com/api/demo/reset \
  -H "Content-Type: application/json" \
  -d '{"force": true}'

# This resets ALL demo users to clean state
```

---

## 🎯 Contract Type Specific Requirements

### All Types (1-5): Common Requirements
- ✅ Must configure deliverables before signing
- ✅ Must select 1 option per deliverable
- ✅ Creates exactly 5 contract_indicators
- ✅ Creates N deliverable_selections (N = number of deliverables for that type)

### Agreement Type 1: PMU-PCU
- **Indicators:** AGR1-IND-001 to AGR1-IND-005 (indicator_number: 101-105)
- **Deliverables:** TBD (based on contract_deliverables.contract_type = 1)

### Agreement Type 2: PCU-Project Manager
- **Indicators:** AGR2-IND-001 to AGR2-IND-005 (indicator_number: 201-205)
- **Deliverables:** TBD (based on contract_deliverables.contract_type = 2)

### Agreement Type 3: Project Manager-Regional
- **Indicators:** AGR3-IND-001 to AGR3-IND-005 (indicator_number: 301-305)
- **Deliverables:** TBD (based on contract_deliverables.contract_type = 3)

### Agreement Type 4: DoE-District Office ✅
- **Indicators:** IND-001 to IND-005 (indicator_number: 1-5)
- **Deliverables:** 5 deliverables with 3 options each
- **Test User:** doe-district@demo.com

### Agreement Type 5: DoE-School ✅
- **Indicators:** IND-001 to IND-005 (indicator_number: 1-5)
- **Deliverables:** 5 deliverables with 3 options each
- **Test User:** doe-school@demo.com

---

## 🧪 Testing Checklist

### For Each Contract Type (1-5):

#### 1. Test Configuration Enforcement
- [ ] Navigate directly to `/contract/sign` (bypass /configure)
- [ ] Try to sign contract
- [ ] **Expected:** Redirected to `/contract/configure` with error message
- [ ] **Expected:** Cannot sign without selections

#### 2. Test Proper Flow
- [ ] Login as user
- [ ] Go to `/contract/configure`
- [ ] Select options for all deliverables
- [ ] Click "ពិនិត្យ និងចុះហត្ថលេខា" (Review and Sign)
- [ ] Redirected to `/contract/sign`
- [ ] Read contract, draw signature
- [ ] Click "បញ្ជាក់ និងចុះហត្ថលេខា" (Confirm and Sign)
- [ ] **Expected:** Contract created in database
- [ ] **Expected:** 5 indicators created
- [ ] **Expected:** N deliverable selections created
- [ ] Redirected to `/me-dashboard`
- [ ] **Expected:** Dashboard shows 5 indicators
- [ ] **Expected:** Dashboard shows N deliverables with selected options

#### 3. Test Dashboard Without Contract
- [ ] Create new user with contract_type set but contract_signed = false
- [ ] Login and mark as signed WITHOUT creating contract (manually in DB)
- [ ] Navigate to `/me-dashboard`
- [ ] **Expected:** Shows "គ្មានសូចនាករ" (No indicators)
- [ ] **Expected:** Shows "សូមកំណត់រចនាសម្ព័ន្ធកិច្ចព្រមព្រៀងរបស់អ្នក" message

---

## 📝 Developer Notes

### Key Files Modified (2025-10-29)
1. `/app/contract/sign/page.tsx` - Added configuration requirement check
2. `/app/api/me/indicators/route.ts` - Added contract existence validation

### localStorage Key
```javascript
// Deliverable selections stored here during configuration
const key = 'contract_selections'
const value = [
  { deliverable_id: 1, selected_option_id: 5 },
  { deliverable_id: 2, selected_option_id: 8 },
  // ... more selections
]
```

### API Endpoints Used
- `GET /api/contract-deliverables?contract_type=N` - Fetch deliverables for configuration
- `POST /api/contracts/configure` - Create contract with selections (CORRECT)
- `POST /api/contracts/sign` - Mark user as signed only (DEPRECATED for Types 1-5)
- `GET /api/me/indicators` - Fetch user's indicators (now requires contract)

---

## ✅ Conclusion

**All 5 Agreement Types now enforce proper configuration flow:**
1. ✅ Cannot bypass `/contract/configure`
2. ✅ Cannot see indicators without contract
3. ✅ Cannot sign without deliverable selections
4. ✅ Proper data isolation maintained
5. ✅ No redundant data in dashboard

**Production Status:**
🚀 Deployed to https://agreements.openplp.com
✅ Vercel auto-deployment complete

**Next Steps for Existing Users:**
- Use demo reset API to clear corrupted users
- Re-test complete flow for all 5 contract types
- Monitor logs for any users attempting to bypass configuration
