# Bug Fixes - Account Settings & Logout Issues

## Summary
Fixed two critical issues in the application:
1. **Account Settings Profile Sync not updating** - Students couldn't save changes to contact info
2. **Student Logout not working** - Users were stuck logged in

---

## Issue 1: Account Settings Profile Sync Update Not Working ❌→✅

### Root Causes Identified:
1. **Axios Credentials Configuration Issue**
   - Setting `axios.defaults.withCredentials` AFTER making the API call
   - Should be set BEFORE or in request config
   - This prevented cookies from being sent, failing authentication

2. **Incomplete Backend Update Logic**
   - Controller only updated `StudentProfile` table
   - Wasn't updating `User` table's phone field
   - Frontend form was sending phone but it wasn't being saved properly

### Changes Made:

#### File: `frontend/src/pages/Settings.jsx`

**Before:**
```javascript
const handleContactSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    axios.defaults.withCredentials = true; // ❌ Set AFTER not working
    const res = await axios.put('http://localhost:5000/api/users/update-settings', contactForm);
    toast.success(res.data.message || 'Settings updated');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update settings');
  } finally {
    setLoading(false);
  }
};
```

**After:**
```javascript
const handleContactSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const config = {
      withCredentials: true, // ✅ Set in config BEFORE request
      headers: { 'Content-Type': 'application/json' }
    };
    const res = await axios.put('http://localhost:5000/api/users/update-settings', contactForm, config);
    toast.success(res.data.message || 'Settings updated');
    setContactForm({ ...contactForm, email: res.data.user?.email || contactForm.email });
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update settings');
  } finally {
    setLoading(false);
  }
};
```

**Same fix applied to `handlePwdSubmit` function**

#### File: `backend/controllers/userController.js`

**Before:**
```javascript
// Only saved if email changed
if (email && email !== user.email) {
  user.email = email;
  await user.save({ transaction: t }); // ❌ Only saved email
}

// StudentProfile updated separately
if (user.role === 'Student') {
  const profile = await StudentProfile.findOne({ where: { userId: req.user.id } });
  if (profile) {
    if (phone) profile.phone = phone;
    if (location) profile.location = location;
    await profile.save({ transaction: t });
  }
}
```

**After:**
```javascript
// Update email
if (email && email !== user.email) {
  user.email = email;
}

// ✅ Now also update phone in User table
if (phone) {
  user.phone = phone;
}

// Save User model with all changes
await user.save({ transaction: t });

// Update StudentProfile for students
if (user.role === 'Student') {
  const profile = await StudentProfile.findOne({ where: { userId: req.user.id } });
  if (profile) {
    if (phone) profile.phone = phone;
    if (location) profile.location = location;
    await profile.save({ transaction: t });
  }
}
```

---

## Issue 2: Student Logout Not Working ❌→✅

### Root Causes Identified:
1. **Async Operation Not Awaited**
   - `dispatch(logout())` is an async thunk but wasn't awaited
   - Redux state was reset immediately without waiting for backend cookie clearing

2. **No Error Handling**
   - If logout API failed, user was still navigated away
   - No fallback mechanism for failed logouts

3. **Missing Replace Navigation**
   - Using `navigate('/login')` allows back button to return to authenticated pages
   - Should use `replace: true` option

### Changes Made:

#### File: `frontend/src/components/Navbar.jsx`

**Before:**
```javascript
const onLogout = () => {
  dispatch(logout()); // ❌ Not awaited - fires and forgets
  dispatch(reset());
  setIsProfileDropdownOpen(false);
  setIsExploreDropdownOpen(false);
  setIsNotificationsOpen(false);
  setIsMobileMenuOpen(false);
  navigate('/login'); // ❌ Can go back to authenticated pages
};
```

**After:**
```javascript
const onLogout = async () => {
  try {
    await dispatch(logout()).unwrap(); // ✅ Wait for logout API call
    dispatch(reset());
    setIsProfileDropdownOpen(false);
    setIsExploreDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login', { replace: true }); // ✅ Prevent back navigation
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout even if API fails
    dispatch(reset());
    setIsProfileDropdownOpen(false);
    setIsExploreDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login', { replace: true });
  }
};
```

---

## Testing Instructions

### Test 1: Profile Sync Update
1. Login as a student
2. Navigate to Settings → Profile Sync
3. Update Phone Number and Location fields
4. Click "Save Changes"
5. ✅ Expected: Toast notification "Profile settings updated successfully"
6. ✅ Refresh page: Data should be persisted

### Test 2: Password Change
1. Login as a student
2. Navigate to Settings → Security & Password
3. Enter current password, new password (6+ chars), and confirm
4. Click "Update Password"
5. ✅ Expected: Toast notification "Password updated successfully!"
6. ✅ Login again with new password

### Test 3: Logout
1. Login as any user (Student/TPO/Company/Admin)
2. Click on Profile dropdown in navbar
3. Click Logout
4. ✅ Expected: Redirect to /login page
5. ✅ Try to go back in browser: Should not access authenticated pages
6. ✅ Try accessing dashboard directly: Should redirect to login

---

## Technical Details

### Cookies & Authentication Flow
- Backend uses `httpOnly` cookies to store JWT tokens
- Frontend must send `withCredentials: true` for cookies to be included in requests
- The middleware `protect` verifies token and populates `req.user`

### Transaction Handling
- Database updates now use proper transaction rollback on errors
- Ensures data consistency between User and StudentProfile tables

### Logout Sequence
1. Frontend calls logout API
2. Backend clears JWT cookie (sets expiry to 10 seconds)
3. Frontend removes user from localStorage
4. Redux state is cleared
5. User redirected to /login with history replaced

---

## Files Modified
- ✅ `frontend/src/pages/Settings.jsx` 
- ✅ `frontend/src/components/Navbar.jsx`
- ✅ `backend/controllers/userController.js`

**No new files created. Only existing files patched.**
