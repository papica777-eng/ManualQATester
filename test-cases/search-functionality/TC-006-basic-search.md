# TC-006: Basic Product Search with Results

**Priority:** High  
**Type:** Positive  
**Component:** Search - Basic Functionality

## Preconditions
- User is on the e-commerce homepage
- Database contains products matching search term "laptop"
- At least 5 products available with keyword "laptop" in title or description
- URL: https://demo-ecommerce.example.com

## Test Steps
| Step | Action | Test Data |
|------|--------|-----------|
| 1 | Navigate to homepage | https://demo-ecommerce.example.com |
| 2 | Locate search bar in header | - |
| 3 | Click into search input field | - |
| 4 | Type search query | laptop |
| 5 | Press Enter or click Search icon | - |
| 6 | Observe search results page | - |

## Expected Result
- ✅ Search redirects to results page: `/search?q=laptop`
- ✅ Results heading displays: "Search results for 'laptop'" with count (e.g., "23 results found")
- ✅ Product cards displayed in grid layout (3-4 per row on desktop)
- ✅ Each product card shows:
  - Product image
  - Product title (with "laptop" highlighted)
  - Price
  - Star rating
  - "Add to Cart" button
- ✅ Results are relevant (contain "laptop" in title or description)
- ✅ Results sorted by relevance by default
- ✅ Pagination controls visible if results exceed 20 items
- ✅ Filter sidebar available (price range, brand, rating)
- ✅ Page loads within 2 seconds

## Actual Result
As expected ✓

## Notes
- **Tested on:** Chrome 120.0.6099.109, Firefox 121.0, Safari 17.2
- **Response time:** 1.2s (API search request)
- **Results count:** 23 products found

### Search Behavior:
- **Case insensitive:** "LAPTOP", "Laptop", "laptop" all return same results ✓
- **Partial match:** "lap" returns laptops and laptop accessories ✓
- **Keyword highlighting:** Search term highlighted in yellow in results ✓
- **Auto-suggest:** Dropdown shows suggestions while typing ✓

### Performance Observations:
- Initial load: 1.2s
- Subsequent searches: 0.8s (likely caching)
- Results per page: 20 (configurable via dropdown)
- Total products in DB matching "laptop": 23

### Responsive Design:
- **Desktop (1920x1080):** 4 products per row
- **Tablet (768x1024):** 2 products per row
- **Mobile (375x667):** 1 product per row, filters collapse to drawer

### API Details (DevTools):
- **Endpoint:** GET `/api/search?q=laptop&page=1&limit=20`
- **Response time:** 1.2s
- **Status:** 200 OK
- **Response structure:**
```json
{
  "query": "laptop",
  "total": 23,
  "page": 1,
  "limit": 20,
  "results": [...]
}
```

### Additional Scenarios Tested:
- **Special characters:** "laptop's" handled correctly ✓
- **Multiple words:** "gaming laptop" returns relevant results ✓
- **Numbers:** "laptop 15 inch" works correctly ✓

### Related Test Cases:
- TC-007 (Advanced filters)
- TC-008 (Empty results)

### Related Bugs:
- None found for basic search
- See BUG-002 for XSS vulnerability in search field
