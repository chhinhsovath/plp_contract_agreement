# Admin Guide: User Reconfiguration Requests

**Date:** 2025-10-29
**Status:** ✅ ENFORCED - Users Cannot Reconfigure Without Approval

---

## 🔒 Reconfiguration Policy

### Current System Behavior
Once a user completes deliverable configuration and signs their contract:
- ❌ **CANNOT** access `/contract/configure` page
- ❌ **CANNOT** resubmit deliverable selections
- ❌ **CANNOT** change their configuration independently
- ✅ **MUST** request admin approval for any changes

### Error Message Shown to Users
When users try to access `/contract/configure` after already configuring:

```
អ្នកបានកំណត់រចនាសម្ព័ន្ធរួចហើយ។ ប្រសិនបើចង់ផ្លាស់ប្តូរ សូមស្នើសុំការអនុម័តពីអ្នកគ្រប់គ្រង។
```

**Translation:** "You have already configured. If you want to change, please request approval from admin."

---

## 👨‍💼 How Admins Can Help Users Reconfigure

### Option 1: Demo Reset (For Demo Users Only)

**Applicable to:** Users with phone numbers: 077806680, 077806681, 077806682, 077806683, 077806684, 077806685

**Steps:**
1. Go to: https://agreements.openplp.com/demo-login
2. Click "កំណត់ទិន្នន័យឡើងវិញឥឡូវនេះ" (Reset Data Now)
3. Confirm reset
4. All demo users reset to clean state
5. Users can now reconfigure

**Database Effect:**
```sql
-- Resets ALL demo users
UPDATE users SET
  contract_signed = false,
  contract_signed_date = NULL,
  signature_data = NULL
WHERE phone_number IN (
  '077806680', '077806681', '077806682',
  '077806683', '077806684', '077806685'
);

-- Deletes their contracts
DELETE FROM contracts WHERE created_by_id IN (
  SELECT id FROM users WHERE phone_number IN (...)
);
```

---

### Option 2: Manual Reset via Dashboard (For Demo Users)

**Location:** ME Dashboard
**Visible to:** Demo users with specific phone numbers

**Steps:**
1. User logs into https://agreements.openplp.com/me-dashboard
2. Clicks "កំណត់ឡើងវិញ" (Reset) button in filter section
3. Confirms reset
4. Their data is cleared
5. Can now reconfigure

---

### Option 3: Database Manual Reset (For Production Users)

**Use Case:** Production users who need to reconfigure

**Required Access:** Database admin access

**Method A: Reset User to Allow Reconfiguration**
```sql
-- Find the user first
SELECT id, full_name, email, phone_number, contract_type, contract_signed
FROM users
WHERE email = 'user@example.com';

-- Reset their signing status (allows reconfiguration)
UPDATE users
SET
  contract_signed = false,
  contract_signed_date = NULL,
  signature_data = NULL
WHERE email = 'user@example.com';

-- Optional: Delete their old contract if needed
DELETE FROM contracts
WHERE created_by_id = (SELECT id FROM users WHERE email = 'user@example.com');

-- User can now access /contract/configure and submit new selections
```

**Method B: Update Existing Contract Selections**
```sql
-- Find user's contract
SELECT c.id, c.contract_number, COUNT(cds.id) as current_selections
FROM contracts c
LEFT JOIN contract_deliverable_selections cds ON cds.contract_id = c.id
WHERE c.created_by_id = (SELECT id FROM users WHERE email = 'user@example.com')
GROUP BY c.id, c.contract_number;

-- Update specific deliverable selection
UPDATE contract_deliverable_selections
SET selected_option_id = NEW_OPTION_ID
WHERE contract_id = CONTRACT_ID
  AND deliverable_id = DELIVERABLE_ID;

-- Note: This requires knowing the exact deliverable and option IDs
```

---

### Option 4: API Reset Endpoint (For Admin Interface)

**Endpoint:** `POST /api/admin/users/{userId}/reset-configuration`

**Payload:**
```json
{
  "userId": 123,
  "reason": "User request - want to change deliverable selections",
  "adminApprovalBy": "admin@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User configuration reset successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "contract_signed": false
  }
}
```

**Status:** ⚠️ NOT YET IMPLEMENTED (Future Enhancement)

---

## 🔍 Verification Checklist

### Before Allowing Reconfiguration

1. **Verify User Identity**
   - [ ] Confirm user email and phone number
   - [ ] Verify contract type (1-5)
   - [ ] Check current configuration status

2. **Check Current Configuration**
   ```sql
   SELECT
     u.full_name,
     u.email,
     c.contract_number,
     COUNT(DISTINCT cds.id) as deliverable_selections,
     COUNT(DISTINCT ci.id) as contract_indicators
   FROM users u
   LEFT JOIN contracts c ON c.created_by_id = u.id
   LEFT JOIN contract_deliverable_selections cds ON cds.contract_id = c.id
   LEFT JOIN contract_indicators ci ON ci.contract_id = c.id
   WHERE u.email = 'user@example.com'
   GROUP BY u.full_name, u.email, c.contract_number;
   ```

3. **Document Reason**
   - [ ] User's reason for reconfiguration
   - [ ] Admin approval timestamp
   - [ ] Changes requested

### After Reconfiguration

1. **Verify New Configuration**
   - [ ] User successfully completed new configuration
   - [ ] All deliverables have selections
   - [ ] Contract indicators created properly (5 indicators)
   - [ ] Dashboard shows new data

2. **Audit Trail**
   ```sql
   -- Log the reconfiguration
   INSERT INTO audit_log (user_id, action, details, performed_by, performed_at)
   VALUES (
     123,
     'RECONFIGURATION',
     'User reconfigured deliverables with admin approval',
     'admin@example.com',
     NOW()
   );
   ```

---

## 📊 User Configuration Status Reference

### Database Status for Configured User
```sql
-- Example: doe-district@demo.com
user.contract_signed = true                  ✅
contracts.count = 1                          ✅
contract_deliverable_selections.count = 5    ✅
contract_indicators.count = 5                ✅ (for proper contracts)
```

### Database Status After Reset
```sql
user.contract_signed = false                 ✅
contracts.count = 0                          ✅
contract_deliverable_selections.count = 0    ✅
contract_indicators.count = 0                ✅
```

---

## 🚨 Important Notes

### For Production Users:
1. **Always get approval** before resetting any production user
2. **Document the reason** in audit log or ticket system
3. **Backup data** before making changes
4. **Test the flow** after reset to ensure user can reconfigure
5. **Verify completion** after user reconfigures

### For Demo Users:
1. **Demo reset is safe** - designed for testing
2. **Can be done multiple times** without issues
3. **All demo users reset together** with demo reset button
4. **No approval needed** for demo environment

### Common Scenarios:

**Scenario 1: User Made Wrong Selection**
- Admin resets user configuration
- User goes to /contract/configure
- User selects correct options
- User signs contract again
- Dashboard shows updated data

**Scenario 2: System Configuration Changed**
- Deliverable options updated by admin
- Users need to reconfigure with new options
- Admin resets affected users
- Users reconfigure with new options

**Scenario 3: Old Contracts from Before Fix**
- User has deliverable_selections but no contract_indicators
- Dashboard shows empty indicators
- Admin resets user
- User reconfigures properly
- New contract has both selections and indicators

---

## 🎯 Best Practices

1. **Communication First**
   - Notify user before resetting
   - Explain what they need to do after reset
   - Provide support if they have questions

2. **Timing**
   - Reset during user's available time
   - Give user deadline to reconfigure
   - Follow up if user doesn't complete

3. **Verification**
   - Check user completed reconfiguration
   - Verify dashboard shows proper data
   - Confirm user is satisfied with new selections

4. **Documentation**
   - Log all resets in admin system
   - Keep record of user requests
   - Track reconfiguration completion

---

## 🔗 Related Documentation

- `docs/PROPER_USER_FLOW_AGREEMENTS.md` - Complete user flow for all 5 contract types
- `docs/CONTRACT_TYPE_FILTERING_SYSTEM.md` - Indicator filtering and data isolation
- `docs/ID_CONVENTION.md` - Database ID conventions

---

## 📝 Future Enhancements

### Planned Features:
1. **Admin Dashboard for User Management**
   - View all users and their configuration status
   - One-click reset button per user
   - Audit log of all resets
   - User notification system

2. **User Self-Service Request**
   - User can submit reconfiguration request
   - Admin receives notification
   - Admin approves/denies in dashboard
   - User automatically notified of decision

3. **Partial Reconfiguration**
   - Allow changing specific deliverables only
   - Instead of full reset
   - Preserve other selections

4. **Configuration History**
   - Track all configuration changes
   - Show previous selections
   - Compare before/after
   - Rollback capability

---

## ✅ Summary

**Current State:**
- ✅ Users CANNOT reconfigure without admin help
- ✅ Clear error message in Khmer
- ✅ Demo users can use reset button
- ✅ Production users need admin manual reset

**Admin Actions Available:**
1. Demo reset (for demo users)
2. Database manual reset (for production)
3. Future: API endpoint for programmatic reset

**Protection Level:** 🔒 High
**User Experience:** ⚠️ Requires admin intervention
**Data Integrity:** ✅ Protected
