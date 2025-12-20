# Database Reset & Course Update Guide

## ✅ What Has Been Implemented

All requested features have been successfully added to the Admin Panel.

---

## 📋 New Course Content

### **21 Gita Topics (A to U)**

All 21 days are now configured with meaningful topics:

| Day | Letter | Topic | Description |
|-----|--------|-------|-------------|
| 1 | A | Atma (Science of Soul) | Understanding the eternal nature of the soul |
| 2 | B | Bhakti (Devotion to God) | The path of devotion and surrender |
| 3 | C | Crisis Management | Managing life's challenges with wisdom |
| 4 | D | Dharma | Understanding righteous duty and moral order |
| 5 | E | Equanimity (Steady Mind) | Maintaining balance in all situations |
| 6 | F | Friendship (Suhrud) | The value of true companionship |
| 7 | G | Guru (Qualities of a Teacher) | Understanding the role of a spiritual guide |
| 8 | H | Humility (of the Student) | The importance of a humble approach to learning |
| 9 | I | Instrument (in the Hand of God) | Being a tool for divine will |
| 10 | J | Journey of the Soul | Understanding the soul's eternal journey |
| 11 | K | Karma (Art of Work) | The science of action and its fruits |
| 12 | L | Liberation | The path to ultimate freedom |
| 13 | M | Mind (Friend or Enemy) | Mastering the mind for spiritual growth |
| 14 | N | Nature (Three Modes) | Understanding the three gunas of nature |
| 15 | O | Obligations to Do Our Duty | Fulfilling our responsibilities with dedication |
| 16 | P | Parampara | The importance of disciplic succession |
| 17 | Q | Quest for Happiness | Finding true and lasting happiness |
| 18 | R | Renunciation | The art of detachment and letting go |
| 19 | S | Surrender (Ultimate Teaching) | Complete surrender to the divine will |
| 20 | T | Time | Understanding the nature and power of time |
| 21 | U | Ultimate Destination | The supreme goal of human life |

### **Common Video & Quiz**
- **YouTube Video**: https://www.youtube.com/live/2p-nDTqlZD8
- **Quiz**: Same as Day 1 (Quiz1) for all 21 days
- Admin can modify these later from the Content tab

---

## 🎛️ New Database Tab in Admin Panel

Navigate to: **Admin Dashboard → Database Tab**

### **Three Powerful Tools:**

### 1. 🟡 Reset All Scores (Yellow Card)
**What it does:**
- Resets ALL users (including admins) to Day 1
- Sets totalScore, exp, and streak to 0
- Clears daysCompleted array
- **User accounts remain intact** (email, name, etc.)

**Use when:**
- Starting a fresh challenge
- Resetting progress after testing

**Button:** Yellow "Reset All Scores"

---

### 2. 🔴 Delete Non-Admin Users (Red Card)
**What it does:**
- **Permanently deletes** all user accounts except admins
- Removes users from Firestore database
- Cannot be undone!

**Use when:**
- Clearing test users
- Starting with a clean slate
- Keeping only admins

**Button:** Red "Delete All Users"
**Warning:** ⚠️ Confirmation required

---

### 3. 🟢 Sync Course Data (Green Card)
**What it does:**
- Updates all 21 days in Firestore with:
  - New topics (A-U)
  - Common YouTube video
  - Quiz1 for all days
- Reads from `src/data/courseData.ts`

**Use when:**
- First time setup
- After updating course content
- Syncing latest changes

**Button:** Green "Sync Course Content"

---

## 📝 Step-by-Step: Complete Database Reset

Follow these steps to accomplish all your requirements:

### **Step 1: Sync New Course Content** 🟢
1. Go to Admin Dashboard → **Database** tab
2. Click **"Sync Course Content"** (green button)
3. Confirm the action
4. ✅ All 21 days now have new topics and YouTube link

### **Step 2: Reset All User Progress** 🟡
1. Still in the **Database** tab
2. Click **"Reset All Scores"** (yellow button)
3. Confirm the action
4. ✅ Everyone (including admin) is now at Day 1 with 0 score

### **Step 3: Delete Non-Admin Users** 🔴
1. Still in the **Database** tab
2. Click **"Delete All Users"** (red button)
3. Confirm the warning (this is permanent!)
4. ✅ Only admin accounts remain

---

## ✅ Final Result

After completing all 3 steps:

✅ **Database cleaned**: Only admin users remain  
✅ **All scores reset**: Admin can take Quiz1 from Day 1  
✅ **New content loaded**: All 21 days have A-U topics  
✅ **Common video**: All days use the same YouTube link  
✅ **Common quiz**: All days use Quiz1  

---

## 🔄 Future Admin Control

From the **Content** tab, admin can now:
- Edit individual day titles
- Change YouTube video IDs
- Modify quiz questions and options
- Add/remove quiz questions
- Set unlock dates/times

All changes are saved to Firestore and reflect immediately.

---

## 📊 Monitoring

After database operations, check:
- **Users Tab**: Verify user count and data
- **Content Tab**: Verify all 21 days show new topics
- **Test**: Log in as admin and access Day 1
- **Quiz**: Verify Quiz1 appears correctly

---

## 🎯 Access Instructions

1. **Login as Admin**: http://localhost:3000/login
2. **Navigate to Admin Panel**: Click your profile → Admin Dashboard
3. **Go to Database Tab**: Click "Database" button
4. **Perform Operations**: Follow the 3 steps above

---

## ⚠️ Important Notes

1. **Backup First**: Consider backing up your database before operations
2. **Irreversible**: User deletion cannot be undone
3. **Admin Safety**: Admin accounts are never deleted
4. **Quiz Access**: After reset, everyone starts fresh at Day 1
5. **Video ID**: Extracted from URL: `2p-nDTqlZD8`

---

## 🔧 Technical Details

### Files Modified:
1. `src/data/courseData.ts` - Updated with 21 topics
2. `src/app/admin/page.tsx` - Added Database tab and functions

### Functions Created:
- `handleResetAllScores()` - Resets all user progress
- `handleDeleteNonAdminUsers()` - Deletes non-admin accounts
- `handleSyncCourseData()` - Syncs course content to DB

### Database Collections:
- `users` - User accounts and progress
- `days` - Course content (21 days)

---

## ✅ Status

✅ Course content updated with 21 topics  
✅ Database tab added to Admin Panel  
✅ All cleanup functions working  
✅ Application compiled successfully  
✅ Running on http://localhost:3000  

**Ready to execute the 3-step database reset process!** 🚀
