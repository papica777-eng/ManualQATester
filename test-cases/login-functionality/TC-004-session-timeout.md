# TC-004: Session Timeout After Inactivity

**Priority:** Medium  
**Type:** Edge Case  
**Component:** Authentication - Session Management

## Preconditions
- User is logged into the application
- Session timeout configured to 30 minutes of inactivity
- No "Remember Me" option selected
- URL: https://demo-ecommerce.example.com/dashboard

## Test Steps
| Step | Action | Test Data |
|------|--------|-----------|
| 1 | Login to the application with valid credentials | testuser@example.com / SecurePass123! |
| 2 | Verify successful login to dashboard | - |
| 3 | Leave the browser tab open without any user interaction | - |
| 4 | Wait for 30 minutes (session timeout period) | - |
| 5 | Attempt to click on any protected feature (e.g., "My Orders") | - |
| 6 | Observe the application behavior | - |

## Expected Result
- ✅ After 30 minutes of inactivity, user is automatically logged out
- ✅ Modal/notification appears: "Your session has expired due to inactivity. Please login again."
- ✅ User is redirected to login page
- ✅ Session cookie is cleared from browser
- ✅ After successful re-login, user is redirected to the originally requested page
- ✅ No sensitive data remains visible after timeout

## Actual Result
As expected ✓

## Notes
- **Tested on:** Chrome 120.0.6099.109, Firefox 121.0
- **Session timeout:** Confirmed at exactly 30 minutes (1800 seconds)
- **Security observations:**
  - Session token properly invalidated on server-side
  - Client-side token removed from localStorage/sessionStorage
  - Cookies cleared (verified via DevTools → Application → Cookies)
  - Attempting to use old session token returns 401 Unauthorized
- **UX observations:**
  - Warning message appears 2 minutes before timeout: "Your session will expire in 2 minutes. Click here to stay logged in."
  - Clicking the warning message extends the session
  - Logout link in header properly clears session
- **Browser behavior:**
  - Chrome: Session persists across tab refreshes if within timeout
  - Firefox: Similar behavior
  - Incognito/Private: Session cleared when browser closed (as expected)
- **Additional scenarios tested:**
  - Active user (clicking/typing): Session stays active and resets timeout counter
  - Multiple tabs: Session shared across tabs, timeout applies globally
  - API calls: Background API calls (e.g., notifications) don't extend session
- **Related test cases:** TC-001 (Valid login), TC-003 (Password reset)
- **Performance:** No memory leaks observed during extended session
