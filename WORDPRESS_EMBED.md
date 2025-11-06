# WordPress Embed Instructions

Your availability calendar is now ready to be embedded in your WordPress site! 🎉

## ✅ What's Working

The calendar embed is fully functional with:
- ✅ Real-time data synchronization between your app and the embed
- ✅ Backend API storing all bookings and events
- ✅ Auto-refresh every 30 seconds
- ✅ All booking statuses (Available, On-Hold, Booked)
- ✅ Event tracking with full details

## 📍 The Embed URLs

You have two options to access your calendar:

### Option A: Static HTML Embed (Recommended for WordPress)
```
https://rork.app/p/7xafww33jbv9jgp99mphc/calendar-embed
```
This is a standalone HTML file that works everywhere, including WordPress embeds.

### Option B: React Native Web View
```
https://rork.app/p/7xafww33jbv9jgp99mphc/embed/calendar
```
This is the full React Native app view. Use this for native mobile apps or testing.

**Test it first**: Open either URL in your browser to make sure it loads before embedding.

## How to Embed

### Option 1: Using an iframe (Recommended)

Add this code to any WordPress page or post (in the HTML/Code editor mode):

```html
<iframe 
  src="https://rork.app/p/7xafww33jbv9jgp99mphc/calendar-embed" 
  width="100%" 
  height="800" 
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>
```

### Option 2: Using WordPress Block Editor

1. Add a "Custom HTML" block to your page
2. Paste the iframe code above
3. Preview and adjust the height as needed

### Customization

You can adjust these parameters in the iframe code:

- `width`: Set to `100%` for full width or specific pixel value like `600px`
- `height`: Adjust based on your needs (recommended: 700-900px)
- `style`: Customize the border, shadow, and other CSS properties

## 🔄 Data Synchronization

Your calendar data is now stored on the backend server:
- ✅ Data syncs automatically between your app and the embed
- ✅ Updates appear in real-time (refreshes every 30 seconds)
- ✅ Both the app and embed fetch from the same backend API
- ✅ When you update bookings in the app, they instantly sync to the backend
- ✅ When you update bookings in one device, they appear on all devices

**How it works**: 
1. You set a booking status in your mobile app
2. The app sends the update to the backend API via tRPC
3. The backend stores the data in memory
4. The embed calendar fetches the data from the same backend
5. Both stay in sync automatically

## 📱 Managing Calendar Data

You can update your calendar in three ways:

### Option 1: Mobile App (Main Interface)
1. Open your mobile app at: https://rork.app/p/7xafww33jbv9jgp99mphc
2. Go to the "Availability" tab
3. Tap on any date to set booking status
4. Changes sync to the backend and appear in the embedded calendar automatically
5. Add events with full details (name, type, financials, etc.)

### Option 2: Backend API (For Developers)
You can also update bookings programmatically via the tRPC API:

**Bookings API:**
- `trpc.calendar.getBookings.query()` - Get all bookings
- `trpc.calendar.setBooking.mutate({ date, status, note, plannerId, customHoldDays })` - Set booking status
- `trpc.calendar.updateHoldDuration.mutate({ days })` - Update default hold duration

**Events API:**
- `trpc.calendar.getEvents.query()` - Get all events
- `trpc.calendar.addEvent.mutate(event)` - Add new event
- `trpc.calendar.updateEvent.mutate({ id, updates })` - Update event
- `trpc.calendar.deleteEvent.mutate({ id })` - Delete event

### Option 3: Calendar Sync API (Optional)
You can integrate with external calendar systems using the `/api/calendar-sync` endpoint for syncing with Google Calendar, iCal, etc.

## 🔧 Troubleshooting

If the calendar doesn't load:

1. **Check the URL**: Make sure you're using the exact URL: `https://rork.app/p/7xafww33jbv9jgp99mphc/calendar-embed` for WordPress embeds
2. **Test directly**: Open the URL in your browser first - it should show the calendar
3. **Clear cache**: Try clearing your browser cache and WordPress cache
4. **Check iframe support**: Some WordPress themes or security plugins block iframes
5. **Verify backend**: Make sure the backend API is running at `https://rork.app/p/7xafww33jbv9jgp99mphc/api/trpc`
6. **Check console**: Open browser developer tools (F12) and check for errors in the console
7. **Test API directly**: Visit `https://rork.app/p/7xafww33jbv9jgp99mphc/api/trpc/calendar.getBookings?batch=1&input=%7B%220%22%3A%7B%7D%7D` to verify the API is working
8. **Contact support**: If issues persist, contact Rork support

## 🎯 Technical Details

**Backend Technology:**
- Server: Hono (Node.js)
- API: tRPC with public procedures (no auth required for embed)
- Storage: In-memory (resets on server restart)
- Auto-sync: 30-second polling interval

**Data Flow:**
```
Mobile App → tRPC Client → Backend API → In-Memory Store
                ↑                              ↓
                └──────── Auto-sync ←──────────┘
                                               ↓
                                    Embed Calendar (reads)
```

**API Endpoints:**
- `GET /api/trpc/calendar.getBookings` - Returns all active bookings
- `POST /api/trpc/calendar.setBooking` - Set/update booking status
- `GET /api/trpc/calendar.getEvents` - Returns all events
- `POST /api/trpc/calendar.addEvent` - Add new event
- `POST /api/trpc/calendar.updateEvent` - Update existing event
- `POST /api/trpc/calendar.deleteEvent` - Delete event

## 🎨 Customization Options

If you need to customize the calendar appearance or functionality:

**Colors & Theme:**
- Modify colors in `constants/colors.ts`
- Update status colors: `available`, `on-hold`, `booked`
- Change autumn theme colors

**Calendar Layout:**
- Update mobile app calendar: `app/(tabs)/availability.tsx`
- Update embed calendar: `app/embed/calendar.tsx`
- Update static HTML embed: `public/calendar-embed.html`

**Backend Logic:**
- Bookings logic: `backend/trpc/routes/calendar/bookings/route.ts`
- Events logic: `backend/trpc/routes/calendar/events/route.ts`
- Add database persistence (currently in-memory)

**Frontend State Management:**
- Venue bookings context: `contexts/VenueContext.tsx`
- Events context: `contexts/EventContext.tsx`
- Both now sync with backend via tRPC

## 💾 Adding Database Persistence

Currently, data is stored in-memory and resets on server restart. To add persistence:

1. Choose a database (PostgreSQL, MongoDB, SQLite, etc.)
2. Update `backend/trpc/routes/calendar/bookings/route.ts`
3. Update `backend/trpc/routes/calendar/events/route.ts`
4. Replace in-memory stores with database queries
5. Add database connection in `backend/trpc/create-context.ts`

Example structure:
```typescript
// Instead of:
let bookingsStore: Record<string, DateBooking> = {};

// Use:
const bookings = await db.bookings.findMany();
```

## 📞 Need Help?

If you need assistance:
- Check the documentation files in the project
- Review the backend API routes
- Test the API endpoints directly
- Contact Rork support for custom features
