🔒 1. Input Validation
🧾 Food Posting (Donor)
 All fields are mandatory
 Food name not empty
 Quantity > 0
 Quantity is numeric
 Expiry time:
 Not in past
 Greater than current time
 Location not empty
 Coordinates valid
 Food type selected
 No negative values
 Trim extra spaces
 Prevent duplicate submission
👤 Registration (All Users)
 Name required
 Email valid format
 Phone number valid (10 digits)
 Password minimum length
 Role selected
 Location provided
🍱 3. Food Posting Rules
 Cannot post expired food
 Cannot edit after claim
 Cannot delete after claim
 Food visible only if:
 Not expired
 Not claimed
 Food auto-expires
🔍 4. NGO Constraints
 NGO sees only active food
 NGO sees only non-expired food
 Filter works (location + expiry)
 Cannot claim expired food
 Cannot claim already claimed food
 Claim button disables after claim
 Claimed food visible in NGO dashboard
⚠️ 5. Claim System (CRITICAL)
 Only one NGO can claim food
 Backend validates before claim
 Prevent double claim (race condition)
 Error shown if already claimed
🚚 6. Volunteer Constraints
 Volunteer sees assigned tasks
 Cannot pick unassigned food
 Must follow correct flow
 Updates:
 Picked
 Delivered
🔄 7. Status Flow Validation
Posted → Claimed → Picked → Delivered → Completed
 Cannot skip steps
 Cannot go backward
 Backend controls status
 Status visible to all users
🧠 8. Data Consistency
 Food linked to correct donor
 Claim linked to correct NGO
 Volunteer linked to correct task
 No duplicate entries
 No missing references
📍 9. Location Handling
 Coordinates stored correctly
 Distance filtering works
 No invalid locations
🖥 10. UI / UX Checks
 Buttons disabled when not allowed
 Clear error messages shown
 No blank pages
 Loading states handled
 Form resets after submission
 Status clearly displayed
⚠️ 11. Edge Cases (VERY IMPORTANT)
 Two NGOs claim at same time
 Food expires before claim
 Donor tries to cancel after claim
 Volunteer delays pickup
 Page refresh after claim
 Network failure handling
🧾 12. Database Checks
 Required fields enforced
 Default values set (status = Posted)
 No null critical fields
 Data properly structured
🚫 13. Error Handling
 "Food already claimed" message
 "Food expired" message
 "Invalid input" message
 No crashes
 No console errors
🔄 14. Synchronization
 Donor sees updated status
 NGO sees claim instantly
 Volunteer sees assigned task
 All dashboards consistent
🔁 15. Auto-Update / Real-Time Behavior
 No need for manual refresh
 Auto-refresh or polling implemented
 NGO claim updates instantly
 Food disappears after claim
 Status updates visible to all users
🎯 16. Full System Flow (MUST WORK PERFECTLY)
 Donor posts food
 NGO sees food
 NGO claims food
 Volunteer assigned
 Volunteer picks food
 Volunteer delivers
 Status updates correctly