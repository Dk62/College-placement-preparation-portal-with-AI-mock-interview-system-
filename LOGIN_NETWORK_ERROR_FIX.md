# Login Network Error - Diagnostic & Fix Guide

## What Causes "Network Error"?
When you see a network error during login, it means the frontend cannot reach the backend server at `http://localhost:5000`.

---

## ✅ Quick Fix Checklist

### Step 1: Ensure MySQL is Running
```bash
# On Windows, check if MySQL service is running
# Open Services (services.msc) or use:
sc query MySQL80
```
**Expected Output:** Should show MySQL service as RUNNING
**If not running:**
- Start MySQL from Services
- Or use: `net start MySQL80`

---

### Step 2: Verify Backend Configuration
Check your `.env` file in `backend/` folder:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Dilkhush99@
DB_NAME=placement_portal
```
**Make sure these values match your local MySQL setup!**

---

### Step 3: Start Backend Server

**Option A: Using npm (Recommended)**
```bash
cd backend
npm install          # Only if dependencies not installed
npm start            # Starts with nodemon
```

**Option B: Direct node**
```bash
cd backend
node server.js
```

**Expected Output:**
```
🔍 Attempting to connect to database...
   Host: localhost
   Port: 3306
   User: root
   Database: placement_portal
✅ Connected to MySQL server
✅ Database placement_portal ensured.
✅ Sequelize database connected successfully.
✅ Database synced.

✅ Server is running on port 5000
📍 Frontend should connect to: http://localhost:5000/api/auth/login
🌐 CORS enabled for: http://localhost:5173
```

**If you see errors**, check:
- ❌ `ENOTFOUND localhost` → Check `DB_HOST` in .env
- ❌ `ECONNREFUSED` → MySQL not running on port 3306
- ❌ `ER_ACCESS_DENIED_FOR_USER` → Wrong `DB_USER` or `DB_PASSWORD`

---

### Step 4: Start Frontend Server

**In a new terminal:**
```bash
cd frontend
npm install          # Only if dependencies not installed
npm run dev          # Starts Vite dev server
```

**Expected Output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

### Step 5: Test Login

1. Open browser to `http://localhost:5173`
2. Go to Login page
3. Enter test credentials:
   - Email: `test@example.com` (or any registered user)
   - Password: `password123` (or correct password)
4. Click "Sign In"

**Expected Behavior:**
- ✅ If credentials are correct → Redirected to dashboard
- ✅ If credentials are wrong → Error message: "Invalid email or password"
- ❌ If you see "Cannot connect to backend" → Backend is not running

---

## 🔍 Network Error Troubleshooting

### Error: "Network Error: Cannot connect to backend server"

**Cause:** Frontend cannot reach `http://localhost:5000`

**Solutions:**

1. **Check Backend is Running**
   ```bash
   # In PowerShell, check if port 5000 is in use
   netstat -ano | findstr :5000
   ```
   If no output → Backend not running → Start it with `npm start`

2. **Check Firewall**
   - Windows Defender may block Node.js
   - Go to Firewall → Advanced Settings → Inbound Rules
   - Look for Node.js or port 5000
   - If blocked, create an exception

3. **Check Database Connection**
   - Verify MySQL is running
   - Try connecting: `mysql -u root -pDilkhush99@ -h localhost`
   - If fails → MySQL not running or wrong credentials

4. **Check Frontend Port**
   - Frontend should run on `http://localhost:5173`
   - Not `http://localhost:5000`
   - Check output of `npm run dev` for correct URL

---

## 📋 Common Credentials for Testing

### Student Account (if seeded)
```
Email: student@example.com
Password: password123
Role: Student
```

### Admin Account (if seeded)
```
Email: admin@example.com
Password: password123
Role: Admin
```

### Register New Account
If no test accounts exist, register a new one:
1. Click "Sign up" on login page
2. Fill in name, email, password, role
3. Submit
4. Use those credentials to login

---

## 🆘 Still Getting Errors?

### Check Backend Logs
When starting backend, you should see:
```
✅ Server is running on port 5000
📍 Frontend should connect to: http://localhost:5000/api/auth/login
🌐 CORS enabled for: http://localhost:5173
```

### Check Frontend Console
In browser, press `F12` → Console tab:
- Look for error messages
- Red text = errors
- Network tab shows failed requests

### Restart Everything
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend (new terminal)
cd frontend
npm run dev
```

### Reset Database (Last Resort)
If tables are corrupted:
```bash
# In MySQL:
DROP DATABASE placement_portal;
# Then restart backend to auto-create
```

---

## 📞 Quick Reference

| What | Where | Command |
|------|-------|---------|
| Start Backend | `/backend` | `npm start` |
| Start Frontend | `/frontend` | `npm run dev` |
| Backend URL | Browser | `http://localhost:5000` |
| Frontend URL | Browser | `http://localhost:5173` |
| API Login | Direct URL | `http://localhost:5000/api/auth/login` |
| MySQL Check | PowerShell | `mysql -u root -p` |

---

## ✨ Success Indicators

When everything works:
- ✅ Backend console shows "Server is running on port 5000"
- ✅ Frontend shows no red errors in console
- ✅ Login form displays clearly
- ✅ Error messages show on wrong credentials (not network errors)
- ✅ Redirects to dashboard on correct login
