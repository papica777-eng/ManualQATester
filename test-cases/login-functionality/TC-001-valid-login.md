# TC-001: Valid Login with Correct Credentials

**Priority:** High  
**Type:** Positive  
**Component:** Authentication - Login

## Preconditions
- User account exists in the system
- Username: `testuser@example.com`
- Password: `SecurePass123!`
- User is logged out
- URL: https://demo-ecommerce.example.com/login

## Test Steps
| Step | Action | Test Data |
|------|--------|-----------|
| 1 | Navigate to login page | https://demo-ecommerce.example.com/login |
| 2 | Enter valid username in the "Email" field | testuser@example.com |
| 3 | Enter valid password in the "Password" field | SecurePass123! |
| 4 | Click "Login" button | - |
| 5 | Verify redirect to user dashboard | - |

## Expected Result
- ✅ Login button becomes active after both fields are populated
- ✅ User is redirected to dashboard page (https://demo-ecommerce.example.com/dashboard)
- ✅ Success message displayed: "Welcome back, Test User!"
- ✅ User profile icon visible in top-right corner
- ✅ Session token stored in browser cookies
- ✅ No console errors present

## Actual Result
As expected ✓

## Notes
- **Tested on:** Chrome 120.0.6099.109, Firefox 121.0, Safari 17.2
- **Response time:** 0.8s (API login request)
- **Session duration:** 30 minutes of inactivity before timeout
- **Related test cases:** TC-004 (Session timeout)
- **Security:** Password field properly masks characters
- **Accessibility:** Form labels properly associated, keyboard navigation works
