# TC-002: Login with Invalid Credentials

**Priority:** High  
**Type:** Negative  
**Component:** Authentication - Login

## Preconditions
- User is on the login page
- Valid user account exists: `testuser@example.com`
- User is logged out
- URL: https://demo-ecommerce.example.com/login

## Test Steps
| Step | Action | Test Data |
|------|--------|-----------|
| 1 | Navigate to login page | https://demo-ecommerce.example.com/login |
| 2 | Enter valid username | testuser@example.com |
| 3 | Enter incorrect password | WrongPassword123 |
| 4 | Click "Login" button | - |
| 5 | Observe error message and behavior | - |

## Expected Result
- ✅ Error message displayed: "Invalid email or password. Please try again."
- ✅ User remains on login page
- ✅ Password field is cleared for security
- ✅ Email field retains the entered value
- ✅ No sensitive information leaked in error message (shouldn't specify which field is wrong)
- ✅ Login attempt logged in system for security monitoring
- ✅ Rate limiting in place (max 5 attempts per 15 minutes)

## Actual Result
As expected ✓

## Notes
- **Tested on:** Chrome 120.0.6099.109, Firefox 121.0
- **Response time:** 0.6s
- **Security considerations:**
  - Error message is generic (doesn't reveal if email exists)
  - Password field cleared after failed attempt
  - Account lockout after 5 failed attempts (tested separately)
- **Additional test scenarios covered:**
  - Invalid email format: Shows "Please enter a valid email"
  - Empty fields: Shows "This field is required"
  - Unregistered email: Same generic error message
- **Related bugs:** None
- **Related test cases:** TC-005 (SQL injection), TC-003 (Password reset)
