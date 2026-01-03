# Escape Room Challenge - Setup Guide

## 📋 What You Need

1. **Python 3.7 or higher** installed on your computer
   - Download from: https://www.python.org/downloads/
   - ⚠️ **IMPORTANT**: During installation, check "Add Python to PATH"

2. All your project files in one folder

## 📁 File Structure

Your project folder should look like this:
```
escape-room/
│
├── README.md
├── start_server.bat
├──code
│  │   ├──assets
│  │   ├── backButton.png
│  │   ├── nextButton.png
│  │   ├── Locked.png
│  │   └──c59ad2bd4ad2fbacd04017debc679ddb.gif
│  │
│  ├── index.html
│  ├── index.js
│  ├── database.js
│  ├── styles.css
│  ├── server.py
│  
└──data/
    └── leaderboard.csv (auto-created)
```

## 🚀 Quick Start

### Step 1: Install Python
1. Go to https://www.python.org/downloads/
2. Download Python (latest version)
3. Run installer
4. ✅ **CHECK THE BOX**: "Add Python to PATH"
5. Click "Install Now"

### Step 2: Start the Server
1. **Double-click** `start_server.bat` ⭐
2. A terminal window will open showing the server is running
3. Your browser will automatically open to the escape room
4. If browser doesn't open, go to: `http://localhost:5000`

### Step 3: Run the Escape Room
- Participants play the game
- Data **automatically saves** to `data/leaderboard.csv`
- Click "🏆 Leaderboard" to see top performers
- **Keep the terminal window open** while running the escape room

### Step 4: Stop the Server
- **Close the terminal window** (click the X)
- Or press `Ctrl+C` in the terminal window
- Or restart your computer (server will stop automatically)

## 💾 Data Storage

### Automatic Saving
- Every completed/failed challenge automatically saves to CSV
- No manual intervention needed
- File location: `data/leaderboard.csv`

### Viewing Data
- **In-App**: Click "🏆 Leaderboard" button
- **CSV File**: Open `data/leaderboard.csv` in Excel
- **Backup**: Click "📥 Download CSV Backup" button

### CSV Format
```csv
ID,Name,Time Spent (sec),Time Remaining (sec),Money Lost,Hints Used,Grade,Status,Completed At
1234567890,John Doe,323,2077,9690,2,A,completed,2024-01-15T10:30:00Z
```

## 🎨 Timer Colors

The timer changes color based on performance:

### **First Player (No records yet):**
- 🟢 **GREEN** - You're setting the first record!
- 🔴 **RED** - Less than 10 minutes remaining

### **Subsequent Players:**
- 🟢 **GREEN** - Beating or matching the best time
- 🟡 **YELLOW** - Slower than best, but more than 10 minutes remaining
- 🔴 **RED** - Less than 10 minutes

## 🔧 Troubleshooting

### "Python is not recognized"
- You didn't check "Add Python to PATH" during installation
- **Fix**: Reinstall Python and check the box

### "pip is not recognized"
- Same issue as above
- **Fix**: Reinstall Python with PATH option

### Server won't start
1. Check error messages in the terminal window
2. Make sure Python is installed correctly
3. Verify all required files are in the same folder

### Browser shows "Can't connect"
- Server might not be running
- **Fix**: Close terminal window, then double-click `start_server.bat` again
- Try going to: `http://127.0.0.1:5000` instead

### Data not saving
- Check if `data` folder exists
- Make sure you have write permissions
- Look at terminal window for error messages

### How do I know if server is running?
- The terminal window will be open and showing messages
- Browser will be able to connect to `http://localhost:5000`

### Server won't stop
- Close the terminal window
- Or open Task Manager (Ctrl+Shift+Esc) and end `python.exe` manually

## 🎮 For Multiple Days/Sessions

### Day 1:
1. Double-click `start_server.bat`
2. Run escape room
3. Data saves automatically
4. Close terminal window when done

### Day 2:
1. Start server again
2. **All previous data automatically loads!**
3. New participants added to same CSV
4. Leaderboard shows all participants from all days
5. Timer colors based on current best time

### Reset Everything:
- Delete `data/leaderboard.csv`
- Next start creates fresh file
- Timer will be green for first player

## 📊 Exporting Data

### For Analysis:
1. Click "📥 Download CSV Backup"
2. Opens in Excel, Google Sheets, etc.
3. Columns include: Name, Time, Money Lost, Hints, Grade

### For Backup:
- Copy entire `data` folder
- Store somewhere safe
- Can restore by copying back

## ⚙️ Customization

### Change Password:
In `index.js`, find:
```javascript
this.correctPassword = this.hexToString("217365637572653230323521");
```
Current password: `!secure2025!`

To change, convert your password to hex at: https://www.rapidtables.com/convert/number/ascii-to-hex.html

### Change Time/Money/Color Thresholds:
In `index.js`, find:
```javascript
this.totalSeconds = 2400; // 40 minutes
this.initialMoney = 72000;
this.maxTimeThreshold = 600; // 10 minutes = red timer
```

## 🆘 Support

If you get stuck:
1. Check the terminal window for error messages
2. Make sure all files are in the same folder
3. Try closing and restarting the server
4. Check that Python is properly installed
5. Verify the terminal window is still open while using the escape room

## 📝 Notes

- Terminal window must stay open while server is running
- CSV file creates automatically on first use
- No internet connection needed
- Works offline
- Data persists between sessions
- Safe to use in escape room environment
- Timer colors dynamically adjust based on best time in leaderboard

## 🎯 Quick Reference

**To Start:** Double-click `start_server.bat`
**To Stop:** Close the terminal window (or press Ctrl+C)
**Data Location:** `data/leaderboard.csv`
**Access URL:** `http://localhost:5000`