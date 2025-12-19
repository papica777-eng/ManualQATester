# BUG-003: [Shopping Cart] Cart Accepts Negative Product Quantities

**Reported By:** Dimitar Prodromov  
**Date:** 2024-12-17  
**Status:** Open  

---

## 📋 Bug Summary

| Field | Details |
|-------|---------|
| **Bug ID** | BUG-003 |
| **Title** | Shopping cart allows negative quantity values causing calculation errors |
| **Severity** | Medium |
| **Priority** | P2 |
| **Type** | Validation / Data Integrity |
| **Component** | Shopping Cart - Quantity Management |
| **Reproducibility** | Always (10/10 attempts) |
| **Found In Version** | v2.3.4 |

---

## 🌍 Environment

| Field | Details |
|-------|---------|
| **URL** | https://demo-ecommerce.example.com/cart |
| **Browser** | Chrome 120.0.6099.109, Firefox 121.0 (both affected) |
| **Operating System** | Windows 11 Pro, macOS Ventura 13.6 |
| **Device** | Desktop |
| **Screen Resolution** | 1920x1080 |
| **Test Account** | testuser@example.com |

---

## 🔍 Steps to Reproduce

### Method 1: Manual Quantity Input

1. Login to the application: `testuser@example.com`
2. Add any product to cart (e.g., "Wireless Mouse - $29.99")
3. Navigate to cart page: https://demo-ecommerce.example.com/cart
4. Locate the quantity input field for the product
5. Clear the current quantity value
6. Type negative number: `-5`
7. Press Tab or click outside the field (blur event)
8. Observe cart total calculation

### Method 2: Browser DevTools Manipulation

1. Open cart page with at least one item
2. Open Chrome DevTools (F12)
3. Inspect the quantity input element
4. In Console, execute:
   ```javascript
   document.querySelector('input[name="quantity"]').value = -10;
   document.querySelector('input[name="quantity"]').dispatchEvent(new Event('change'));
   ```
5. Observe cart behavior

---

## ❌ Actual Result

**System accepts negative quantities without validation:**

1. Quantity field displays: `-5`
2. Cart calculations become incorrect:
   - **Subtotal:** -$149.95 (29.99 × -5)
   - **Tax:** -$11.25 (negative tax)
   - **Shipping:** $5.99 (still positive)
   - **Total:** -$155.21 (NEGATIVE total!)
3. "Proceed to Checkout" button remains enabled
4. No error message displayed
5. No validation preventing negative input
6. Item remains in cart with negative quantity

**Visual Issues:**
- Cart badge in header shows: "-5 items" (negative count)
- Subtotal shows: "-$149.95" (negative currency)
- Cart appears to "owe user money"

**API Response (Network Tab):**
```json
PUT /api/cart/items/12345
Request:
{
  "quantity": -5
}

Response: 200 OK
{
  "id": 12345,
  "product_id": 789,
  "quantity": -5,
  "price": 29.99,
  "subtotal": -149.95
}
```
→ Backend accepts negative quantity without validation!

---

## ✅ Expected Result

System should validate and prevent negative quantities:

**Input Validation:**
- ✅ Quantity field should only accept positive integers (1, 2, 3, ...)
- ✅ Negative values should be rejected
- ✅ Zero should either:
  - Remove item from cart, OR
  - Show error: "Quantity must be at least 1"
- ✅ Decimal values should be rejected (0.5, 1.5, etc.)

**Error Handling:**
- ✅ Error message: "Please enter a valid quantity (minimum: 1)"
- ✅ Input field reverts to previous valid value
- ✅ "Proceed to Checkout" button disabled if validation fails
- ✅ Visual feedback (red border, error icon)

**HTML Input Attributes:**
```html
<input 
  type="number" 
  name="quantity" 
  min="1" 
  max="99" 
  step="1"
  required
/>
```

**Backend Validation:**
```javascript
if (quantity < 1 || quantity > 99 || !Number.isInteger(quantity)) {
  return res.status(400).json({
    error: "Invalid quantity. Must be between 1 and 99."
  });
}
```

---

## 📸 Evidence

### Screenshot 1: Negative Quantity in Cart
![Cart showing -5 quantity with negative subtotal -$149.95](#)

### Screenshot 2: Negative Total Amount
![Cart total showing -$155.21 due to negative quantity](#)

### Screenshot 3: Cart Badge Shows Negative Count
![Header cart badge displaying "-5 items"](#)

### Screenshot 4: DevTools Network Request
![Network tab showing PUT request with quantity: -5 accepted by backend](#)

### Console Testing
```javascript
// Test various invalid inputs
const testCases = [
  { input: -5, expected: "rejected", actual: "accepted ❌" },
  { input: -100, expected: "rejected", actual: "accepted ❌" },
  { input: 0, expected: "rejected or remove", actual: "accepted ❌" },
  { input: 0.5, expected: "rejected", actual: "accepted ❌" },
  { input: "abc", expected: "rejected", actual: "shows NaN ❌" }
];
```

---

## 💥 Impact & Business Effect

**User Impact:**
- **Data Integrity:** Cart data becomes invalid and unreliable
- **Confusion:** Users see negative totals, think system is broken
- **Checkout Blocked:** Payment processor rejects negative amounts
- **Refund Abuse:** Potentially exploitable (attacker could try negative quantity to get "refunded")

**Business Impact:**
- **Financial Risk:** Edge case could potentially be exploited for fraud
- **Database Integrity:** Negative quantities stored in orders table
- **Reporting Errors:** Sales reports show incorrect data
- **Inventory Issues:** Negative quantities could cause stock calculation errors
- **Payment Processing:** Checkout fails when attempting negative payment
- **User Trust:** Unprofessional appearance, users lose confidence

**Scenarios:**

1. **Accidental User Error:**
   - User mistypes "-" before number
   - System accepts it without warning
   - User proceeds to checkout → payment fails
   - Result: Abandoned cart, frustration

2. **Malicious Exploitation:**
   - Attacker attempts to exploit negative pricing
   - Creates order with negative total
   - Payment processor rejects, but order record created
   - Result: Data inconsistency, potential fraud attempt

3. **Inventory Impact:**
   - Order with quantity -5 processed
   - Inventory system adds 5 back to stock (instead of subtracting)
   - Result: Inventory count inaccurate

---

## 🔄 Reproducibility

- **Frequency:** 10 out of 10 attempts (100% - Always)
- **Conditions:**
  - Any logged-in user with items in cart
  - Both manual input and DevTools manipulation work
  - Affects all products in cart
  - No rate limiting or validation present
- **Affected browsers:** Chrome ✓, Firefox ✓, Safari (likely) ✓
- **Affected platforms:** Desktop ✓, Mobile ✓

**Test Matrix:**
| Input Value | Expected | Actual | Status |
|-------------|----------|--------|--------|
| 1 | Accepted | Accepted | ✅ Pass |
| 5 | Accepted | Accepted | ✅ Pass |
| 99 | Accepted | Accepted | ✅ Pass |
| 100 | Rejected or capped | Accepted | ⚠️ Issue |
| 0 | Rejected/Remove | Accepted | ❌ Fail |
| -1 | Rejected | Accepted | ❌ Fail |
| -5 | Rejected | Accepted | ❌ Fail |
| -999 | Rejected | Accepted | ❌ Fail |
| 0.5 | Rejected | Accepted | ❌ Fail |
| "abc" | Rejected | NaN error | ❌ Fail |

---

## 🛠 Workaround

**User Workaround:**
1. Always enter positive quantities
2. Use increment/decrement buttons instead of manual input (if available)
3. If negative quantity entered accidentally, refresh page to reset

**System Workaround (Temporary):**
- Add client-side JavaScript validation before submitting
- However, backend validation still required (client-side can be bypassed)

---

## 📝 Additional Notes

**Root Cause:**
1. **Frontend:** HTML input lacks `min="1"` attribute
2. **Frontend:** No JavaScript validation on change event
3. **Backend:** No server-side validation of quantity value
4. **Database:** No CHECK constraint on quantity column

**Vulnerable Code Pattern (suspected):**

**Frontend (React/JavaScript):**
```javascript
// VULNERABLE - No validation
<input 
  type="number" 
  value={quantity}
  onChange={(e) => updateQuantity(e.target.value)}
/>

// SHOULD BE:
<input 
  type="number" 
  value={quantity}
  min="1"
  max="99"
  onChange={(e) => {
    const val = parseInt(e.target.value);
    if (val >= 1 && val <= 99) {
      updateQuantity(val);
    } else {
      showError("Quantity must be between 1 and 99");
    }
  }}
/>
```

**Backend (Node.js/Express):**
```javascript
// VULNERABLE - No validation
app.put('/api/cart/items/:id', (req, res) => {
  const { quantity } = req.body;
  // Missing: if (quantity < 1 || quantity > 99) return error
  updateCartItem(id, quantity);
});

// SHOULD BE:
app.put('/api/cart/items/:id', (req, res) => {
  const { quantity } = req.body;
  
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return res.status(400).json({
      error: "Invalid quantity. Must be an integer between 1 and 99."
    });
  }
  
  updateCartItem(id, quantity);
});
```

**Database Schema (Recommendation):**
```sql
ALTER TABLE cart_items 
ADD CONSTRAINT check_quantity_positive 
CHECK (quantity >= 1 AND quantity <= 99);
```

**Recommended Fix (Multi-layer validation):**

1. **HTML (First line of defense):**
   ```html
   <input type="number" min="1" max="99" step="1" required />
   ```

2. **JavaScript (User feedback):**
   ```javascript
   if (quantity < 1 || quantity > 99 || !Number.isInteger(quantity)) {
     showError("Quantity must be between 1 and 99");
     return;
   }
   ```

3. **Backend API (Security):**
   ```javascript
   if (quantity < 1 || quantity > 99) {
     return res.status(400).json({ error: "Invalid quantity" });
   }
   ```

4. **Database (Data integrity):**
   ```sql
   CHECK (quantity BETWEEN 1 AND 99)
   ```

**Additional Validation Needed:**
- ❌ Decimal quantities: 0.5, 1.5 (currently accepted)
- ❌ Very large numbers: 999999 (no upper limit)
- ❌ Special characters in API: `quantity: "abc"` causes 500 error
- ❌ Null/undefined values not handled properly

**Security Considerations:**
- Low severity security issue (not directly exploitable for financial gain)
- Could be used in combination with other bugs
- Mainly a data integrity / UX issue
- Payment processor would reject negative amounts (final safety net)

**Related Test Cases:**
- None directly, but could create TC-009 for shopping cart validation

**Related Bugs:**
- None currently

**Similar Issues Found:**
- Discount code field allows negative values (not tested thoroughly yet)
- Gift card balance could potentially go negative (requires further testing)

---

## 📊 Priority & Severity Justification

**Severity: Medium (Not Critical)**
- Reason: Payment processor rejects negative amounts, preventing financial loss
- However: Creates poor UX and data integrity issues
- No immediate security threat, but should be fixed

**Priority: P2 (Fix in current sprint)**
- Reason: Affects data quality and user experience
- Easy fix with high value (prevents user confusion)
- Should be addressed before more users encounter it

**Not P1 because:**
- Doesn't block critical user flows
- Workaround exists (enter positive numbers)
- Payment fails safely (doesn't process negative charges)

---

**Report Status:** Open  
**Assigned To:** Frontend Team + Backend Team (requires both)  
**Target Fix Version:** v2.4.0 (Next release)  
**Estimated Fix Time:** 4-6 hours (frontend validation + backend validation + testing)  
**Testing Required:** Regression testing on cart and checkout flow after fix
