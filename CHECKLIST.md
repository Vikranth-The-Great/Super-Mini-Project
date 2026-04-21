# Browser-Only Checklist

🔒 1. Input Validation
- All fields are mandatory where applicable
- Food name is not empty
- Quantity is numeric and positive
- Expiry time is in the future
- Location is not empty
- Coordinates are valid when provided
- Duplicate submissions are prevented

👤 2. Registration and Login
- User, NGO, and delivery registration works locally
- Email format is validated
- Phone number is validated where required
- Password minimum length is enforced
- Session state survives reloads

🍱 3. Food Posting Rules
- Expired food cannot be posted
- Posted food is stored in localStorage
- Food history is visible after refresh

🔍 4. NGO and Delivery Views
- NGO users see active, claimable food only
- Delivery users see assigned tasks only
- Claim and delivery actions update browser state immediately

🔄 5. Status Flow Validation
- Posted -> Assigned -> In Transit -> Delivered
- Status cannot move backward
- The UI reflects the current stored status

🧠 6. Data Consistency
- Donations are linked to the correct donor
- Notifications are linked to the correct recipient
- No duplicate records are created on refresh

🖥 7. UI and UX Checks
- Buttons are disabled when an action is not allowed
- Error messages are readable
- Loading and empty states are handled
- Forms reset after successful submission

⚠️ 8. Edge Cases
- Page refresh after claim or delivery still preserves data
- Empty storage seeds demo data once
- Invalid inputs do not crash the app

🎯 9. Full System Flow
- Donor signs up and posts food
- NGO claims the donation
- Delivery partner accepts and completes pickup
- Status and notifications remain visible after reloads