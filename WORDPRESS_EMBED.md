# WordPress Embed Instructions

Your availability calendar is now ready to be embedded in your WordPress site!

## How to Embed

### Option 1: Using an iframe (Easiest)

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

Your calendar data is now stored on the backend server, so:
- ✅ Bookings persist across page refreshes
- ✅ Data is synchronized in real-time
- ✅ Updates made in your app are instantly visible on WordPress
- ✅ Updates made on WordPress embed are visible in your app

## Updating Calendar Data

To manage your calendar availability:

1. Open your mobile app
2. Go to the "Availability" tab
3. Add or modify bookings
4. Changes will automatically appear on your WordPress site

## Need Help?

If you need to customize the calendar appearance or functionality, you can:
- Modify the colors in `constants/colors.ts`
- Update the layout in `app/embed/calendar.tsx`
- Add additional features to the backend routes

## URL Reference

Your calendar embed URL:
```
https://rork.app/p/7xafww33jbv9jgp99mphc/embed/calendar
```

You can also access it directly in a browser to test before embedding.
