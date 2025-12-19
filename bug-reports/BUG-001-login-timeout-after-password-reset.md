# BUG-001: [Authentication] User Cannot Login Immediately After Password Reset

**Reported By:** Dimitar Prodromov  
**Date:** 2024-12-15  
**Status:** Open  

---

## 📋 Bug Summary

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-001 |
| **Title** | User cannot login immediately after successful password reset |
| **Severity** | High |
| **Priority** | P1 |
| **Type** | Functional |
| **Component** | Authentication - Password Reset Flow |
| **Reproducibility** | Always (10/10 attempts) |
| **Found In Version** | v2.3.4 |

---

## 🌍 Environment

| Field | Details |
|-------|---------|
| **URL** | https://demo-ecommerce.example.com/login |
| **Browser** | Chrome 120.0.6099.109, Firefox 121.0 (both affected) |
| **Operating System** | Windows 11 Pro, macOS Ventura 13.6 |
| **Device** | Desktop (Lenovo ThinkPad), MacBook Pro 14" |
| **Screen Resolution** | 1920x1080 |
| **Test Account** | testuser@example.com |

---

## 🔍 Steps to Reproduce

1. Navigate to login page: https://demo-ecommerce.example.com/login
2. Click "Forgot Password?" link
3. Enter email address: `testuser@example.com`
4. Click "Send Reset Link" button
5. Check email and click password reset link (within 5 minutes)
6. Enter new password: `NewSecurePass456!`
7. Confirm new password: `NewSecurePass456!`
8. Click "Reset Password" button
9. Verify success message: "Password successfully reset! Please login."
10. **Immediately** click "Login" link or navigate to login page
11. Enter email: `testuser@example.com`
12. Enter new password: `NewSecurePass456!`
13. Click "Login" button
14. Observe error behavior

---

## ❌ Actual Result

Login fails with error message: **"Invalid email or password. Please try again."**

**Detailed Observations:**
- Error appears immediately (0.4s response time)
- Password was correctly entered (verified by showing password)
- Multiple attempts (5x) within first 2 minutes all fail
- After waiting **3-5 minutes**, login succeeds with the same new password
- Console shows API error: `401 Unauthorized`

**Console Error:**
```javascript
POST https://demo-ecommerce.example.com/api/auth/login 401 (Unauthorized)
{
  "error": "Invalid credentials",
  "code": "AUTH_FAILED"
}
```

**Timeline:**
- T+0s: Password reset successful
- T+10s: Login attempt #1 - FAILED
- T+30s: Login attempt #2 - FAILED
- T+60s: Login attempt #3 - FAILED
- T+180s: Login attempt #4 - SUCCESS ✓

---

## ✅ Expected Result

After successfully resetting password, user should be able to login **immediately** with the new password:

- ✅ New password should be active in the system immediately
- ✅ Login should succeed without delay
- ✅ User should be redirected to dashboard
- ✅ Success message: "Welcome back, Test User!"
- ✅ No need to wait arbitrary time period

---

## 📸 Evidence

### Screenshot 1: Password Reset Success
![Password reset success message showing "Password successfully reset! Please login."](#)

### Screenshot 2: Immediate Login Failure
![Login error showing "Invalid email or password" right after reset](#)

### Screenshot 3: Console Error
![Chrome DevTools showing 401 Unauthorized response](#)

### Network Tab Details
```
Request: POST https://demo-ecommerce.example.com/api/auth/login
Status: 401 Unauthorized
Response Time: 423ms

Request Payload:
{
  "email": "testuser@example.com",
  "password": "NewSecurePass456!"
}

Response:
{
  "error": "Invalid credentials",
  "code": "AUTH_FAILED",
  "timestamp": "2024-12-15T10:23:45Z"
}
```

### Video Recording
Screen recording available showing complete flow: password reset → immediate login failure → wait 3 minutes → successful login  
(Recorded using OBS Studio - 2min 45sec)

---

## 💥 Impact & Business Effect

**User Impact:**
- **100% of users** performing password reset affected
- Users believe their password reset failed, leading to:
  - Multiple failed login attempts (account lockout risk)
  - Confusion and frustration
  - Password reset re-attempts
  - Support ticket creation

**Business Impact:**
- **Critical user experience issue** - users lose trust in the system
- Increased support workload (estimated 15-20 tickets/day)
- Users may abandon platform thinking password reset is broken
- Potential account lockouts (5 failed attempts = locked)
- **Reputation damage:** "Password reset doesn't work"

**Severity Justification:**
- Blocks 100% of users attempting password reset
- No clear workaround (users don't know to wait)
- Affects core authentication functionality
- Creates false security concern for users

---

## 🔄 Reproducibility

- **Frequency:** 10 out of 10 attempts (100% - Always)
- **Conditions:** 
  - Occurs immediately after password reset (within first 2-3 minutes)
  - Affects both Chrome and Firefox
  - Reproducible on both Windows and macOS
  - Occurs regardless of password complexity
- **Affected browsers:** Chrome ✓, Firefox ✓, Safari (not tested)

**Test Matrix:**
| Attempt | Wait Time | Result |
|---------|-----------|--------|
| 1 | 10 seconds | FAIL ❌ |
| 2 | 30 seconds | FAIL ❌ |
| 3 | 1 minute | FAIL ❌ |
| 4 | 2 minutes | FAIL ❌ |
| 5 | 3 minutes | SUCCESS ✅ |

---

## 🛠 Workaround

**Current workaround (not ideal):**
1. After resetting password, **wait 3-5 minutes** before attempting login
2. User must manually refresh the page after waiting
3. Then login with new password should work

**Problem with workaround:**
- Not intuitive - users don't know to wait
- No message warns users about the delay
- Still creates poor user experience

---

## 📝 Additional Notes

**Probable Root Cause:**
- Likely **database replication lag** or **cache invalidation delay**
- Password hash updated in write database but not yet propagated to read replicas
- Login service reading from cached/stale data for 3-5 minutes
- Possible Redis cache TTL issue (password cache not invalidated immediately)

**Technical Investigation:**
- Checked Redis cache: Old password hash still present for 180 seconds after reset
- Database logs show: `UPDATE users SET password_hash = '...' WHERE id = 123` completes immediately
- Redis cache key: `auth:password:testuser@example.com` has TTL of 300 seconds (5 minutes)
- Cache not being invalidated on password reset event

**Suggested Fix:**
1. **Immediate fix:** Invalidate password cache immediately on password reset:
   ```python
   redis.delete(f"auth:password:{user.email}")
   ```
2. **Alternative:** Update cache with new password hash immediately instead of waiting for expiry
3. **Long-term:** Implement cache invalidation pattern for all authentication updates

**Related Test Cases:**
- TC-003 (Password reset flow) - This bug found during TC-003 execution
- TC-001 (Valid login) - Partially affected

**Related Bugs:**
- None currently

**Database Schema (for context):**
```sql
users table:
- id (PRIMARY KEY)
- email (UNIQUE)
- password_hash
- updated_at (shows correct timestamp after reset)
```

**Priority Justification (P1):**
- Blocks critical user flow (password recovery)
- 100% reproducibility
- Affects all users attempting password reset
- Simple fix (cache invalidation)
- High support impact

---

## 📊 Test Results Comparison

**Before Bug:**
- Password reset: 100% success rate
- Immediate login: Expected to be 100%

**After Bug Discovered:**
- Password reset: 100% technical success (password updated in DB)
- Immediate login: 0% success (users must wait 3-5 minutes)
- Login after wait: 100% success

---

**Report Status:** Open - Awaiting developer assignment  
**Assigned To:** Backend Team  
**Target Fix Version:** v2.3.5 (Hotfix)  
**Estimated Fix Time:** 2-4 hours (simple cache invalidation)
