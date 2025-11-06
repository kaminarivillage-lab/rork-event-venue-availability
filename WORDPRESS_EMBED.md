# WordPress Embed Instructions

Your availability calendar is now ready to be embedded in your WordPress site!

## Important: The Working URLs

You have two options to access your calendar:

### Option A: Static HTML Embed (Recommended for WordPress)
```
https://rork.app/p/7xafww33jbv9jgp99mphc/public/calendar-embed.html
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
  src="https://rork.app/p/7xafww33jbv9jgp99mphc/public/calendar-embed.html" 
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

## Data Synchronization

Your calendar data is stored on the server:
- ✅ Data syncs automatically between your app and the embed
- ✅ Updates appear in real-time (refreshes every 30 seconds)
- ✅ Both the app and embed fetch from the same backend API

**Note**: The embed calendar shows the same data you manage in your app.

## Managing Calendar Data

You can update your calendar in two ways:

### Option 1: Mobile App
1. Open your mobile app at: https://rork.app/p/7xafww33jbv9jgp99mphc
2. Go to the "Availability" tab
3. Add or modify bookings
4. Changes sync to the embedded calendar automatically

### Option 2: Backend API
You can also update bookings via the tRPC API:
- **Get bookings**: `trpc.calendar.getBookings.query()`
- **Set booking**: `trpc.calendar.setBooking.mutate({ date, status, ... })`
- **Get events**: `trpc.calendar.getEvents.query()`

## Troubleshooting

If the calendar doesn't load:

1. **Check the URL**: Make sure you're using the exact URL: `https://rork.app/p/7xafww33jbv9jgp99mphc/public/calendar-embed.html` for WordPress embeds
2. **Test directly**: Open the URL in your browser first - it should show the calendar
3. **Clear cache**: Try clearing your browser cache and WordPress cache
4. **Check iframe support**: Some WordPress themes or security plugins block iframes
5. **Verify backend**: Make sure the backend API is running at `https://rork.app/p/7xafww33jbv9jgp99mphc/api/trpc`
6. **Contact support**: If issues persist, contact Rork support

## Need Help?

If you need to customize the calendar appearance or functionality, you can:
- Modify the colors in `constants/colors.ts`
- Update the layout in `app/embed/calendar.tsx`
- Add additional features as needed
