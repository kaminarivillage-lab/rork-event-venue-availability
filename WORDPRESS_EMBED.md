# WordPress Embed Instructions

Your availability calendar is now ready to be embedded in your WordPress site!

## Important: The Working URL

Your embed calendar is accessible at:
```
https://rork.app/p/7xafww33jbv9jgp99mphc/embed/calendar
```

**Test it first**: Open this URL in your browser to make sure it loads before embedding.

## How to Embed

### Option 1: Using an iframe (Recommended)

Add this code to any WordPress page or post (in the HTML/Code editor mode):

```html
<iframe 
  src="https://rork.app/p/7xafww33jbv9jgp99mphc/embed/calendar" 
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

## Data Persistence

Your calendar data is stored locally using AsyncStorage:
- ✅ Bookings persist in your mobile app
- ✅ Updates made in your app are visible in the embedded calendar
- ✅ Both the app and embed read from the same local storage

**Note**: The embed calendar shows the same data you manage in your mobile app's "Availability" tab.

## Updating Calendar Data

To manage your calendar availability:

1. Open your mobile app at: https://rork.app/p/7xafww33jbv9jgp99mphc
2. Go to the "Availability" tab
3. Add or modify bookings
4. The embedded calendar will show the updated data

## Troubleshooting

If the calendar doesn't load:

1. **Check the URL**: Make sure you're using the exact URL: `https://rork.app/p/7xafww33jbv9jgp99mphc/embed/calendar`
2. **Test directly**: Open the URL in your browser first - it should show the calendar
3. **Clear cache**: Try clearing your browser cache and WordPress cache
4. **Check iframe support**: Some WordPress themes or security plugins block iframes
5. **Contact support**: If issues persist, contact Rork support

## Need Help?

If you need to customize the calendar appearance or functionality, you can:
- Modify the colors in `constants/colors.ts`
- Update the layout in `app/embed/calendar.tsx`
- Add additional features as needed
