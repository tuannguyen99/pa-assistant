# Target Settings Auto-Save - User Guide

## What's New?

Your target settings form now automatically saves your work every 3 seconds! You'll never lose your progress again.

## Visual Guide

### 1. Clean Form (No Changes)
```

  Draft  Phase 1: Target Setting                       
                                                          
 [Save Draft] (DISABLED - gray)  [ Submit]            

```
**Save Draft button is disabled** - Nothing to save yet!

---

### 2. Making Changes
```

  Draft  Phase 1: Target Setting                       
                                                          
 [ Save Draft] (ENABLED - blue)  [ Submit]          


You type: "Develop new features for Q1..."
                    
Wait 3 seconds... Timer starts counting
```
**Save Draft button is now enabled** - You can click to save manually!

---

### 3. Auto-Save in Progress
```

  Draft  Phase 1   Auto-saving...                    
                                                          
 [ Saving...] (DISABLED)  [ Submit]                  


         
           Auto-saving draft...           Toast (top-right)
         
```
**Saving automatically** - You can keep typing, we're saving in the background!

---

### 4. Auto-Save Complete
```

  Draft  Phase 1: Target Setting                       
                                                          
 [Save Draft] (DISABLED - gray)  [ Submit]            


         
           Draft auto-saved successfully   Toast (green, 3s)
                                       []  
         
```
**Save complete!** - Button disabled again, your work is safe!

---

### 5. Manual Save
```
You click: [ Save Draft]
              


  Draft  Phase 1: Target Setting                       
                                                          
 [ Saving...] (DISABLED)  [ Submit]                  


         
           Saving draft...                Toast
         

               (after save completes)

         
           Draft saved successfully        Toast (green)
                                       []  
         
```
**Manual save successful!** - Instant feedback, your data is saved!

---

### 6. Trying to Leave with Unsaved Changes
```
You make changes...
You try to close tab or navigate away...
              


                   Browser Alert                     
                                                        
  You have unsaved changes in your target settings.   
  Do you want to leave without saving?                
                                                        
                 [Stay on Page]  [Leave]               

```
**Protected!** - We'll always warn you before you lose work!

---

### 7. Save Error (Network Issue)
```

  Draft  Phase 1: Target Setting                       
                                                          
 [ Save Draft] (ENABLED)  [ Submit]                  


         
           Failed to auto-save draft.      Toast (red, 5s)
            Please try manual save.    [] 
         
```
**Clear error message** - We'll tell you exactly what went wrong!

---

## How It Works

### Auto-Save
1. You make any change to the form
2. Timer starts counting (3 seconds)
3. If you keep typing, timer resets
4. After 3 seconds of no typing, auto-save triggers
5. Notification shows the save result
6. Button automatically disables after save

### Manual Save
1. Click "Save Draft" button any time
2. Immediate save (doesn't wait 3 seconds)
3. Loading spinner shows progress
4. Success/error notification appears
5. Button disables after successful save

### Change Detection
We track changes to:
-  Current Role field
-  Long-term Goal field
-  All Target descriptions
-  All KPI fields
-  All Weight values
-  All Difficulty levels

### Data Protection
-  Auto-saves every 3 seconds
-  Manual save always available
-  Warning before leaving page
-  Latest data loaded on page refresh
-  No data loss even with 200+ users saving simultaneously

## Tips

###  Best Practices
1. **Let auto-save work for you** - Just keep typing, we'll save automatically
2. **Manual save for peace of mind** - Click "Save Draft" before important meetings
3. **Watch for notifications** - Green = saved, Red = error
4. **Don't close tabs immediately** - Wait for the "saved successfully" message

###  Important Notes
- **Button disabled = Changes are saved** - This is normal and expected
- **3-second delay is intentional** - Prevents saving while you're typing
- **Notifications auto-disappear** - You can also close them manually
- **Internet required** - Auto-save needs network connection

###  Troubleshooting
- **Not saving?** Check your internet connection
- **Button won't enable?** Make sure you've actually changed something
- **Notification disappeared?** It auto-closes after 3-5 seconds
- **Lost connection?** Manual save will show clear error message

## Testing Scenarios

###  Normal Usage
1. Open form  Button disabled 
2. Type something  Button enabled 
3. Wait 3 seconds  Auto-save notification 
4. Button disabled  Save successful 

###  Quick Edits
1. Type quickly  Timer resets 
2. Stop typing  3-second countdown 
3. Auto-save triggers  Notification shows 

###  Manual Save
1. Type something  Button enabled 
2. Click "Save Draft" immediately  Saves instantly 
3. Success notification  Button disabled 

###  Data Protection
1. Make changes  Don't save 
2. Try to close tab  Warning appears 
3. Click "Stay"  Back to form 

## For Developers

### Testing the Implementation
```bash
# Start the app
npm run dev

# In another terminal, run load test
node tests/load/target-save-load-test.js

# Expected: >99% success rate with 200 concurrent users
```

### Documentation
- **Full docs:** `docs/target-settings-autosave.md`
- **Summary:** `IMPLEMENTATION-SUMMARY.md`
- **Code:** `src/components/targets/TargetSettingForm.tsx`

---

**Questions?** Check the comprehensive documentation in `docs/target-settings-autosave.md`

**Last Updated:** November 11, 2025  
**Version:** 1.0.0  
**Status:**  Production Ready
