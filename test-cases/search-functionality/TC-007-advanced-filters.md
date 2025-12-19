# TC-007: Advanced Search with Multiple Filters

**Priority:** Medium  
**Type:** Positive  
**Component:** Search - Filter Functionality

## Preconditions
- User is on search results page
- Initial search performed for "laptop"
- 23 results displayed
- URL: https://demo-ecommerce.example.com/search?q=laptop

## Test Steps
| Step | Action | Test Data |
|------|--------|-----------|
| 1 | Perform basic search for "laptop" | laptop |
| 2 | Verify initial results displayed | 23 products |
| 3 | Apply price range filter | Min: $500, Max: $1500 |
| 4 | Observe filtered results | - |
| 5 | Apply brand filter | Dell, HP |
| 6 | Observe further filtered results | - |
| 7 | Apply rating filter | 4 stars and above |
| 8 | Observe final filtered results | - |
| 9 | Verify URL updates with filter parameters | - |
| 10 | Clear all filters and verify return to original results | - |

## Expected Result
- ✅ After price filter: Results reduced to laptops between $500-$1500
- ✅ After brand filter: Only Dell and HP laptops shown (e.g., 8 results)
- ✅ After rating filter: Only products with ≥4 stars displayed (e.g., 6 results)
- ✅ Results counter updates dynamically: "6 of 23 results"
- ✅ URL updates with filter params: `/search?q=laptop&price_min=500&price_max=1500&brands=Dell,HP&rating=4`
- ✅ Active filters displayed as chips/badges above results
- ✅ Each chip has "X" button to remove individual filter
- ✅ "Clear All Filters" button visible and functional
- ✅ Page doesn't reload when applying filters (AJAX/dynamic)
- ✅ No products outside filter criteria displayed

## Actual Result
As expected ✓

## Notes
- **Tested on:** Chrome 120.0.6099.109, Firefox 121.0
- **Response time:** 0.4s per filter applied (AJAX requests)

### Filter Behavior:
| Filter Applied | Results Count | Response Time |
|----------------|---------------|---------------|
| No filters | 23 products | - |
| Price: $500-$1500 | 15 products | 0.4s |
| + Brand: Dell, HP | 8 products | 0.3s |
| + Rating: 4+ stars | 6 products | 0.3s |

### URL Deep Linking:
- ✅ Copying filtered URL maintains all filters when pasted in new tab
- ✅ Browser back button properly restores previous filter state
- ✅ Sharing filtered URL preserves search + filters for recipients

### Filter Options Available:
1. **Price Range:**
   - Slider with min/max inputs
   - Range: $0 - $5000
   - Step: $50

2. **Brand (Checkboxes):**
   - Dell (12 products)
   - HP (8 products)
   - Lenovo (15 products)
   - Apple (10 products)
   - Asus (18 products)
   - Shows product count per brand

3. **Rating (Radio buttons):**
   - 5 stars (3 products)
   - 4 stars and up (14 products)
   - 3 stars and up (20 products)
   - All ratings (23 products)

4. **Availability:**
   - In Stock only (checkbox)
   - Reduces to 18 products when checked

5. **Sort By (Dropdown):**
   - Relevance (default)
   - Price: Low to High
   - Price: High to Low
   - Customer Rating
   - Newest First

### UX Observations:
- Filter sidebar collapses on mobile (hamburger menu icon)
- Active filters clearly highlighted with blue background
- "Clear All" button only visible when filters applied
- Filter counts update in real-time as selections change
- Smooth animations when results update

### API Details:
- **Endpoint:** GET `/api/search` with multiple query params
- **Example:** `/api/search?q=laptop&price_min=500&price_max=1500&brands=Dell,HP&rating=4`
- **Response time:** 0.3-0.4s per filter
- **Method:** AJAX (XHR) - no page reload

### Edge Cases Tested:
- **No results after filtering:** Shows "No products match your filters. Try adjusting your criteria." ✓
- **Invalid price range** (max < min): Form validation prevents this ✓
- **Removing all filters:** Returns to original 23 results ✓
- **Multiple brands selected:** Works as OR logic (Dell OR HP) ✓

### Cross-Browser Compatibility:
- **Chrome:** All filters work perfectly ✓
- **Firefox:** All filters work perfectly ✓
- **Safari:** Price slider slightly different UI, but functional ✓
- **Mobile (iOS/Android):** Filter drawer works correctly ✓

### Performance:
- Filtering doesn't cause page reload (SPA behavior)
- Each filter application takes 0.3-0.4s
- No noticeable lag or UI freezing

### Related Test Cases:
- TC-006 (Basic search)
- TC-008 (Empty results)

### Related Bugs:
- None found for filter functionality
