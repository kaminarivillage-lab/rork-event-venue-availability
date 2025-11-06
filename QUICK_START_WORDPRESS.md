# Quick Start: WordPress Calendar Embed

## 🚀 Ready to Use!

Your availability calendar is **already working** and ready to embed in WordPress!

## 📋 Quick Steps

### 1. Copy the Embed Code

```html
<iframe 
  src="https://rork.app/p/7xafww33jbv9jgp99mphc/calendar-embed" 
  width="100%" 
  height="800" 
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>
```

### 2. Add to WordPress

**Method A: Block Editor**
1. Edit your WordPress page
2. Click **+** to add a block
3. Search for "Custom HTML"
4. Paste the iframe code above
5. Click "Publish" or "Update"

**Method B: Classic Editor**
1. Edit your WordPress page
2. Switch to "Text" mode (not "Visual")
3. Paste the iframe code above
4. Click "Publish" or "Update"

### 3. Test It!

Visit your WordPress page - you should see the calendar! 🎉

## 📱 Managing Your Calendar

To update the calendar data:

1. Open your app: https://rork.app/p/7xafww33jbv9jgp99mphc
2. Go to the "Availability" tab
3. Tap any date to set its status (Available/On-Hold/Booked)
4. Changes appear on your WordPress site automatically!

## 🔄 How Data Syncs

```
Your Mobile App ➡️ Backend Server ➡️ WordPress Embed
     (edit)           (stores)          (displays)
```

- Updates sync in **real-time** (refreshes every 30 seconds)
- All devices see the same data
- No manual syncing needed!

## ✅ What's Included

Your calendar embed shows:
- ✅ Available dates (green)
- ✅ On-hold dates (orange) with countdown
- ✅ Booked dates (red)
- ✅ Monthly stats (available/on-hold/booked counts)
- ✅ Navigation between months
- ✅ Today's date highlighted
- ✅ Color legend

## ⚙️ Customization

Want to change the height? Update this line:
```html
height="800"
```

Want full width? Keep this:
```html
width="100%"
```

Want specific width? Change to:
```html
width="600px"
```

## 🆘 Troubleshooting

**Calendar not showing?**
1. Make sure iframes are allowed in WordPress
2. Check your theme doesn't block iframes
3. Try disabling security plugins temporarily
4. View page source to ensure iframe code is there

**Calendar shows but no data?**
1. Test the URL directly: https://rork.app/p/7xafww33jbv9jgp99mphc/calendar-embed
2. Check if backend is running
3. Add some bookings in the mobile app first

**Still having issues?**
- Check WORDPRESS_EMBED.md for detailed troubleshooting
- Contact Rork support

## 📚 More Information

For detailed documentation, see:
- **WORDPRESS_EMBED.md** - Full embed documentation
- **Backend API details** - How the data syncs
- **Customization options** - Change colors, layout, etc.

---

**That's it!** Your calendar should now be embedded and working on WordPress. 🎊
