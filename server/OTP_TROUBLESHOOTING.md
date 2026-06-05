# OTP Troubleshooting Guide

## Quick Diagnostics

### 1. Check Server is Running
```bash
# Server should show:
[DATABASE] MongoDB connected successfully
[SERVER] Server is running at http://localhost:4000
```

### 2. Test Email Configuration
```bash
node test-email.js
```
**Expected Output:**
```
✅ SMTP connection verified successfully!
✅ Test email sent successfully!
```

### 3. Test Server Configuration
```bash
node check-config.js
```
**Expected Output:**
```
✅ All required environment variables are configured!
```

### 4. Check Health Status
Visit: `http://localhost:4000/healthcheck`

**Expected Response:**
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "email": "configured"
  }
}
```

## Common Issues & Solutions

### Issue 1: "OTP not sending" / Email timeout

**Symptoms:**
- Request stays pending
- Frontend shows "Sending OTP..." forever
- Server logs show timeout errors

**Solutions:**
1. **Check Gmail App Password:**
   ```
   ❌ Regular Gmail password - WON'T WORK
   ✅ Gmail App Password - REQUIRED
   ```

2. **Generate App Password:**
   - Enable 2FA on Gmail
   - Visit: https://myaccount.google.com/apppasswords
   - Generate password for "Mail"
   - Update `.env` with new password

3. **Check Firewall:**
   - Ensure port 465 (SMTP) is not blocked
   - Try disabling firewall temporarily

4. **Network Issues:**
   - Check internet connection
   - Try from different network
   - Check if Gmail SMTP is accessible

**Test:**
```bash
node test-email.js
```

---

### Issue 2: "No pending signup found"

**Symptoms:**
- OTP verification fails
- Error: "No pending signup found"

**Cause:**
- OTP was never sent successfully
- OTP expired (5 minutes)
- Database connection issue

**Solutions:**
1. Check server logs for `[SEND-OTP]` messages
2. Verify OTP was sent: Look for `✅ OTP email sent successfully`
3. Check OTP expiry (5 minutes limit)
4. Request new OTP

---

### Issue 3: "Invalid OTP"

**Symptoms:**
- Correct OTP entered but fails
- Error: "Invalid OTP"

**Causes:**
- Typo in OTP
- Copy-paste added spaces
- OTP case sensitivity

**Solutions:**
1. Check OTP carefully (6 digits)
2. Avoid copy-paste (type manually)
3. Request new OTP if unsure

---

### Issue 4: "OTP expired"

**Symptoms:**
- Error: "OTP expired"
- Took longer than 5 minutes

**Solution:**
- Request new OTP
- Complete verification within 5 minutes

---

### Issue 5: "User already exists"

**Symptoms:**
- Error: "User already exists"

**Causes:**
- Email already registered
- Previous signup completed

**Solutions:**
1. Try logging in instead
2. Use forgot password if needed
3. Use different email

---

### Issue 6: "Email service not configured"

**Symptoms:**
- Error: "Email service not configured"
- Server logs show missing credentials

**Solution:**
Check `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Verify:**
```bash
node check-config.js
```

---

### Issue 7: "Failed to send OTP email"

**Symptoms:**
- Server logs show email error
- Error message about email failure

**Debug Steps:**

1. **Check server logs:**
   ```
   [SEND-OTP] Failed to send OTP email: { error: '...' }
   ```

2. **Common error codes:**
   - `EAUTH`: Invalid credentials
   - `ETIMEDOUT`: Network/firewall issue
   - `ECONNREFUSED`: SMTP server unreachable

3. **Test email independently:**
   ```bash
   node test-email.js
   ```

4. **Check Gmail settings:**
   - 2FA enabled?
   - App Password generated?
   - "Less secure apps" not needed with App Password

---

## Debugging Workflow

### Step 1: Check Environment
```bash
node check-config.js
```
Must show all variables configured ✅

### Step 2: Test Email Service
```bash
node test-email.js
```
Must show email sent successfully ✅

### Step 3: Check Server Logs
Look for these sequences:

**Successful OTP Send:**
```
[SEND-OTP] Request received: { email: 'user@example.com' }
[SEND-OTP] Generated OTP for: user@example.com
[SEND-OTP] Pending user created successfully
[EMAIL] SMTP connection verified successfully
[EMAIL] Message sent successfully
[SEND-OTP] OTP email sent successfully
✅ Process completed successfully
```

**Successful OTP Verify:**
```
[VERIFY-OTP] Request received: { email: 'user@example.com' }
[VERIFY-OTP] Creating new user: user@example.com
[VERIFY-OTP] User created successfully
[VERIFY-OTP] Welcome email sent successfully
✅ Process completed successfully
```

### Step 4: Monitor Network Tab
In browser DevTools:
1. Check `/api/auth/send-otp` request
2. Should complete in < 30 seconds
3. Should return 200 status
4. Response: `{ "message": "OTP sent to email successfully", "email": "..." }`

---

## Error Code Reference

| Error Code | Meaning | Action |
|------------|---------|--------|
| 400 | Bad Request | Check input fields |
| 401 | Unauthorized | Check credentials |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Check server logs |
| 503 | Service Unavailable | Check email/database |

---

## Server Logs Explained

### Good Signs ✅
```
[EMAIL] SMTP connection verified successfully
[SEND-OTP] OTP email sent successfully
[VERIFY-OTP] User created successfully
```

### Warning Signs ⚠️
```
[EMAIL] SMTP verification failed
[SEND-OTP] Failed to send OTP email
[VERIFY-OTP] No pending user found
```

### Critical Issues ❌
```
[EMAIL] Failed to send email: EAUTH
[DATABASE] MongoDB connection FAILED
[SERVER] Uncaught Exception
```

---

## Prevention Tips

1. **Use Gmail App Password** (not regular password)
2. **Complete OTP verification within 5 minutes**
3. **Type OTP manually** (avoid copy-paste)
4. **Check spam folder** for OTP emails
5. **Monitor server logs** during testing
6. **Test email service** before going live

---

## Testing Checklist

Before deploying:

- [ ] `node check-config.js` shows all green ✅
- [ ] `node test-email.js` sends email successfully ✅
- [ ] Server starts without errors ✅
- [ ] `/healthcheck` returns status "ok" ✅
- [ ] Test signup flow end-to-end ✅
- [ ] Check OTP email arrives ✅
- [ ] Verify OTP works ✅
- [ ] Check welcome email arrives ✅

---

## Still Having Issues?

1. **Check server logs** - Most issues are logged with context
2. **Run diagnostic scripts** - `test-email.js` and `check-config.js`
3. **Review error messages** - They include troubleshooting hints
4. **Check network** - Firewall, internet connection
5. **Verify Gmail settings** - App password, 2FA enabled

---

## Support Resources

- [ERROR_HANDLING.md](ERROR_HANDLING.md) - Comprehensive error handling guide
- [FIXES_SUMMARY.md](FIXES_SUMMARY.md) - Summary of all improvements
- Server logs - Real-time debugging information

---

**Remember:** Most OTP issues are related to Gmail App Password configuration. Make sure you're using an App Password, not your regular Gmail password!
