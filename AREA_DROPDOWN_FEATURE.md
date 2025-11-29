# Area Dropdown Feature

## Overview
Added a dynamic area dropdown field that populates based on the pincode entered by customers during registration, profile updates, and checkout.

## Implementation

### 1. **Location Data Integration**
   - Uses the existing `locationData.ts` file with 300+ Bangalore locations
   - Function `getAllLocationsForPincode(pincode)` returns all areas for a given pincode
   - Supports multiple areas per pincode (e.g., pincode 560001 has 11 areas)

### 2. **Dynamic Behavior**
   - **Pincode Entry**: Customer enters 6-digit pincode
   - **Auto-Population**: Dropdown automatically populates with available areas
   - **Smart Validation**: Area becomes required only if areas are available for that pincode
   - **Fallback**: If no areas found, shows a text input for manual entry
   - **Auto-Reset**: If pincode changes, area resets if not valid for new pincode

### 3. **Pages Updated**

#### **Checkout Page** (`CheckoutPage.tsx`)
   - Added `area` field to delivery address
   - Dynamic dropdown appears after entering valid 6-digit pincode
   - Shows count of available areas
   - Required field when areas are available
   - Sent to backend as `delivery_area`

#### **Profile Page** (`ProfilePage.tsx`)
   - Added `area` field to user profile
   - Same dynamic behavior as checkout
   - Editable when in edit mode
   - Displays saved area when not editing

### 4. **User Experience**

**Scenario 1: Pincode with Multiple Areas**
```
User enters: 560034
Dropdown shows:
- Select your area
- Agara
- Kendriya Sadan
- Koramangala
- Koramangala I block
- St. john's medical college

Helper text: "5 areas available for this pincode"
```

**Scenario 2: Pincode Not in Database**
```
User enters: 123456
Shows: Text input field
Placeholder: "Enter area (Optional)"
```

**Scenario 3: Single Area Pincode**
```
User enters: 560100
Dropdown shows:
- Select your area
- Electronics City

Helper text: "1 area available for this pincode"
```

### 5. **Validation Rules**
   - Area is **required** when dropdown has options
   - Area is **optional** when no areas found (manual entry)
   - Pincode must be 6 digits to trigger area lookup
   - Area resets when pincode changes to invalid value

### 6. **Technical Details**

**State Management:**
```typescript
const [availableAreas, setAvailableAreas] = useState<string[]>([]);

useEffect(() => {
  if (pincode && pincode.length === 6) {
    const areas = getAllLocationsForPincode(pincode);
    setAvailableAreas(areas);
    // Reset area if not valid for new pincode
    if (area && !areas.includes(area)) {
      setArea('');
    }
  } else {
    setAvailableAreas([]);
  }
}, [pincode]);
```

**Form Data:**
```typescript
interface DeliveryAddress {
  // ... other fields
  pincode: string;
  area: string;  // NEW FIELD
  landmark: string;
}
```

**API Payload:**
```json
{
  "delivery_pincode": "560034",
  "delivery_area": "Koramangala",  // NEW FIELD
  "delivery_city": "Bengaluru urban",
  "delivery_state": "Karnataka"
}
```

### 7. **Benefits**
   - **Accuracy**: Ensures correct area names from predefined list
   - **User-Friendly**: Auto-suggests areas, reducing typing errors
   - **Flexible**: Falls back to manual entry for unknown pincodes
   - **Consistent**: Same behavior across checkout and profile pages
   - **Delivery Optimization**: Helps in route planning with accurate area data

### 8. **Backend Requirements**
The backend should accept and store the `delivery_area` field:
- Add `delivery_area` field to Order model
- Add `area` field to User profile model
- Update API endpoints to accept this field

### 9. **Future Enhancements**
   - Add area search/filter in dropdown for long lists
   - Show area on map when selected
   - Suggest nearby areas if exact pincode not found
   - Auto-fill city and state based on pincode
   - Validate pincode against serviceable areas

## Files Modified
- ✅ `frontend/v2/project/src/pages/customer/CheckoutPage.tsx`
- ✅ `frontend/v2/project/src/pages/customer/ProfilePage.tsx`
- ✅ Uses existing `frontend/v2/project/src/data/locationData.ts`

## Testing Checklist
- [ ] Enter valid Bangalore pincode (e.g., 560034) - dropdown appears
- [ ] Select area from dropdown - saves correctly
- [ ] Enter invalid pincode - text input appears
- [ ] Change pincode - area resets appropriately
- [ ] Submit form without selecting area (when required) - validation error
- [ ] Edit profile with existing area - displays correctly
- [ ] Save profile with new area - updates successfully
