# TC-003: Password Reset Flow (Complete Process)

**Priority:** High  
**Type:** Positive  
**Component:** Authentication - Password Reset

## Preconditions
- User account exists: `testuser@example.com`
- User has access to the email inbox
- User is on the login page
- URL: https://demo-ecommerce.example.com/login

## Test Steps
| Step | Action | Test Data |
|------|--------|-----------|
| 1 | Navigate to login page | https://demo-ecommerce.example.com/login |
| 2 | Click "Forgot Password?" link | - |
| 3 | Verify redirect to password reset page | /password-reset |
| 4 | Enter registered email address | testuser@example.com |
| 5 | Click "Send Reset Link" button | - |
| 6 | Verify confirmation message | - |
| 7 | Check email inbox for reset link | - |
| 8 | Click reset link from email | - |
| 9 | Verify redirect to password change page | - |
| 10 | Enter new password | NewSecurePass456! |
| 11 | Confirm new password | NewSecurePass456! |
| 12 | Click "Reset Password" button | - |
| 13 | Verify success message and redirect | - |
| 14 | Login with new password | NewSecurePass456! |

## Expected Result
- ✅ "Forgot Password?" link clearly visible on login page
- ✅ Password reset page loads successfully
- ✅ Success message: "If this email exists, you'll receive a password reset link"
- ✅ Email received within 2 minutes with reset link
- ✅ Reset link contains unique token (e.g., /reset?token=abc123xyz)
- ✅ Reset link expires after 1 hour
- ✅ Password change page has validation:
  - Minimum 8 characters
  - At least one uppercase, lowercase, number, special character
  - New password cannot match old password
- ✅ Success message: "Password successfully reset! Please login."
- ✅ User redirected to login page
- ✅ Login successful with new password
- ✅ Old password no longer works

## Actual Result
As expected ✓

## Notes
- **Tested on:** Chrome 120.0.6099.109
- **Email delivery time:** 45 seconds average
- **Token expiration:** Confirmed - link invalid after 1 hour
- **Security observations:**
  - Generic success message (doesn't reveal if email exists in system)
  - Token is single-use (cannot be reused after password reset)
  - HTTPS enforced on all password-related pages
  - Password strength indicator shown in real-time
- **Edge cases tested:**
  - Non-existent email: Same generic message (security best practice)
  - Expired token: Shows "This link has expired. Please request a new one."
  - Already used token: Shows "This link has already been used."
- **Related bugs:** BUG-001 (Login timeout after password reset - see bug-reports/)
- **UX notes:** Password requirements clearly displayed on the form
