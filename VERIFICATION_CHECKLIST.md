# Verification Checklist - WordPress Calendar Embed

Use this checklist to verify that everything is working correctly.

## ✅ Pre-Deployment Checklist

### 1. Backend API Health
- [ ] Open API endpoint: https://rork.app/p/7xafww33jbv9jgp99mphc/api/trpc/calendar.getBookings?batch=1&input=%7B%220%22%3A%7B%7D%7D
- [ ] Should return JSON with `{ "result": { "data": { "bookings": {}, "holdDuration": ... }}}`
- [ ] No error messages in response

### 2. Static HTML Embed
- [ ] Open: https://rork.app/p/7xafww33jbv9jgp99mphc/calendar-embed
- [ ] Calendar loads and displays
- [ ] Month navigation works (left/right arrows)
- [ ] Stats show correct counts
- [ ] No console errors (F12 → Console)

### 3. React Native Web Embed
- [ ] Open: https://rork.app/p/7xafww33jbv9jgp99mphc/embed/calendar
- [ ] Calendar loads and displays
- [ ] Same data as static HTML version
- [ ] No console errors

### 4. Mobile App Sync
- [ ] Open mobile app: https://rork.app/p/7xafww33jbv9jgp99mphc
- [ ] Go to "Availability" tab
- [ ] Can see calendar view
- [ ] Can tap dates to change status

---

## ✅ Data Sync Test

Follow these steps to verify data syncs correctly:

### Step 1: Set a Booking in Mobile App
- [ ] Open mobile app availability tab
- [ ] Tap on a date 3 days from today
- [ ] Select "On-Hold" status
- [ ] Add client name (optional)
- [ ] Confirm the action
- [ ] Date should turn orange in the app

### Step 2: Verify Backend Has the Data
- [ ] Wait 5 seconds for sync
- [ ] Open API endpoint (see link in section 1 above)
- [ ] Search for your date in the JSON response
- [ ] Should see: `"YYYY-MM-DD": { "status": "on-hold", ... }`

### Step 3: Check WordPress Embed
- [ ] Open calendar embed URL in new tab
- [ ] Wait up to 30 seconds
- [ ] Date should turn orange
- [ ] Stats should show "1" for On-Hold
- [ ] If you added client name, hover/check if shown

### Step 4: Update the Booking
- [ ] Go back to mobile app
- [ ] Tap the same date again
- [ ] Change to "Booked" status
- [ ] Date should turn red in app

### Step 5: Verify Change in Embed
- [ ] Go back to calendar embed
- [ ] Wait up to 30 seconds
- [ ] Date should turn red
- [ ] Stats should show "1" for Booked, "0" for On-Hold

### Step 6: Remove the Booking
- [ ] Go back to mobile app
- [ ] Tap the same date
- [ ] Change to "Available" status
- [ ] Date should turn green in app

### Step 7: Verify Removal in Embed
- [ ] Go back to calendar embed
- [ ] Wait up to 30 seconds
- [ ] Date should turn green
- [ ] Stats should show "0" for Booked

---

## ✅ WordPress Integration Test

### Step 1: Create Test Page
- [ ] Log into WordPress admin
- [ ] Create new page: "Calendar Test"
- [ ] Add "Custom HTML" block

### Step 2: Add Embed Code
```html
<iframe 
  src="https://rork.app/p/7xafww33jbv9jgp99mphc/calendar-embed" 
  width="100%" 
  height="800" 
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>
```
- [ ] Paste code into HTML block
- [ ] Save as draft

### Step 3: Preview
- [ ] Click "Preview" button
- [ ] Calendar should load in preview
- [ ] Should show same data as standalone embed
- [ ] Month navigation should work

### Step 4: Publish
- [ ] Click "Publish" button
- [ ] Visit the live page
- [ ] Calendar should load
- [ ] Should be same as preview

### Step 5: Mobile Test
- [ ] Open WordPress page on mobile device
- [ ] Calendar should be responsive
- [ ] Should fit screen width
- [ ] Should be scrollable if needed

---

## ✅ Performance Test

### Loading Speed
- [ ] Calendar loads within 3 seconds
- [ ] No visible lag or freezing
- [ ] Month navigation is smooth

### Auto-Refresh
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Watch for API calls
- [ ] Should see requests every 30 seconds
- [ ] Requests should complete quickly (<500ms)

### Multiple Bookings
- [ ] Add 5-10 bookings in mobile app
- [ ] Open calendar embed
- [ ] All bookings should appear
- [ ] Stats should be accurate
- [ ] No performance issues

---

## ✅ Edge Cases

### Expired Holds
- [ ] Set a hold with custom duration (e.g., 1 day)
- [ ] Come back after expiry time
- [ ] Hold should auto-expire
- [ ] Date should return to "Available"

### Multiple Events Same Date
- [ ] Try to book multiple events on same date
- [ ] Should handle gracefully
- [ ] Latest event should show

### Network Issues
- [ ] Disconnect internet
- [ ] Open calendar embed
- [ ] Should show error or last cached data
- [ ] Reconnect internet
- [ ] Should auto-recover

### Server Restart
- [ ] Note current bookings
- [ ] Restart backend server (if you have access)
- [ ] Open calendar embed
- [ ] Should show empty calendar (in-memory cleared)
- [ ] Re-add bookings in mobile app
- [ ] Should appear in embed again

---

## ✅ Browser Compatibility

Test on multiple browsers:

### Desktop
- [ ] Chrome - Calendar works
- [ ] Firefox - Calendar works
- [ ] Safari - Calendar works
- [ ] Edge - Calendar works

### Mobile
- [ ] Chrome Mobile - Calendar works
- [ ] Safari Mobile - Calendar works
- [ ] Firefox Mobile - Calendar works

---

## ✅ WordPress Compatibility

Test with your WordPress setup:

- [ ] Current WordPress version: ___________
- [ ] Theme: ___________
- [ ] Security plugins active: ___________
- [ ] Calendar loads with theme: Yes / No
- [ ] Calendar loads with plugins: Yes / No
- [ ] If No, which plugin blocks? ___________

---

## 🐛 Common Issues & Solutions

### Calendar Doesn't Load
**Symptom:** Blank space where calendar should be
**Checks:**
- [ ] View page source - is iframe code present?
- [ ] Open iframe URL directly - does it work?
- [ ] Check browser console for errors
- [ ] Check WordPress security settings

**Solution:**
1. Verify iframe is not blocked by security plugin
2. Check Content Security Policy settings
3. Try in incognito/private mode

### Data Not Syncing
**Symptom:** Changes in app don't appear in embed
**Checks:**
- [ ] API endpoint returns correct data
- [ ] Mobile app shows change immediately
- [ ] Waited at least 30 seconds
- [ ] Browser not caching old version

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check API endpoint directly
4. Verify backend is running

### Calendar Shows Old Data
**Symptom:** Embed shows outdated information
**Checks:**
- [ ] API has new data
- [ ] Auto-refresh is working (check Network tab)
- [ ] No caching plugins interfering

**Solution:**
1. Clear WordPress cache
2. Clear browser cache
3. Reduce polling interval if needed

---

## 📊 Success Criteria

Your implementation is successful if:

- [x] ✅ Backend API returns data
- [x] ✅ Static HTML embed loads
- [x] ✅ React Native embed loads
- [x] ✅ Mobile app can set bookings
- [x] ✅ Changes sync within 30 seconds
- [x] ✅ WordPress iframe embed works
- [x] ✅ Calendar is responsive
- [x] ✅ Auto-refresh works
- [x] ✅ All status colors correct
- [x] ✅ Stats display accurately

---

## 🎉 Final Verification

If all items above are checked, your WordPress calendar embed is:
- ✅ Fully functional
- ✅ Properly synced
- ✅ Production ready
- ✅ WordPress compatible

**Congratulations!** Your implementation is complete and working correctly.

---

## 📝 Notes

Use this space to note any issues or customizations:

```
Date Tested: ___________
Tested By: ___________
WordPress Version: ___________
Theme: ___________

Issues Found:
1. ___________
2. ___________
3. ___________

Resolutions:
1. ___________
2. ___________
3. ___________

Custom Modifications:
1. ___________
2. ___________
3. ___________
```

---

*Use this checklist every time you deploy or make changes to the calendar embed.*
