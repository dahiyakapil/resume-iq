# Error Handling Guide

## Overview
This application now includes comprehensive error handling across all major components.

## Key Improvements

### 1. Email Service Error Handling
- **Timeout Configuration**: Added 30-second timeout for email sending
- **SMTP Verification**: Verifies SMTP connection before sending emails
- **Detailed Logging**: Logs all email-related errors with context
- **Graceful Fallbacks**: Cleans up pending users if email fails

### 2. OTP System Error Handling
- **Validation**: Comprehensive input validation with detailed error messages
- **Email Format Check**: Validates email format before processing
- **Cleanup on Failure**: Removes pending users if OTP sending fails
- **Expiry Management**: Proper handling of expired OTPs
- **Detailed Logging**: Logs every step of the OTP process

### 3. Database Error Handling
- **Connection Monitoring**: Tracks connection state changes
- **Timeout Configuration**: 10-second connection timeout
- **Event Listeners**: Monitors disconnections and reconnections
- **Graceful Shutdown**: Handles SIGTERM signals properly

### 4. Global Error Handling
- **Uncaught Exceptions**: Catches and logs all uncaught exceptions
- **Unhandled Rejections**: Handles promise rejections
- **Request Timeouts**: 60-second timeout for all requests
- **404 Handler**: Proper handling of unknown routes

## Error Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response (Production)
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

### Error Response (Development)
```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": "Additional error details",
  "stack": "Error stack trace"
}
```

## Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, missing fields |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g., email) |
| 500 | Internal Server Error | Server-side issues |
| 503 | Service Unavailable | Database or email service down |

## Logging System

All logs follow this format:
```
[CONTEXT] Action: { details }
```

### Log Contexts
- `[EMAIL]` - Email service operations
- `[SEND-OTP]` - OTP sending process
- `[VERIFY-OTP]` - OTP verification process
- `[DATABASE]` - Database operations
- `[SERVER]` - Server-level events
- `[ERROR]` - Unhandled errors

## Troubleshooting OTP Issues

### Issue: OTP not sending

1. **Check email credentials**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Check logs** for:
   - `[EMAIL] SMTP connection verified successfully` ✓
   - `[SEND-OTP] OTP email sent successfully` ✓

3. **Common problems**:
   - Invalid Gmail app password
   - SMTP blocked by firewall
   - Timeout due to slow network
   - Invalid email format

### Issue: OTP verification failing

1. **Check if pending user exists**:
   - Log: `[VERIFY-OTP] No pending user found`
   - Solution: Request new OTP

2. **Check OTP expiry**:
   - OTPs expire after 5 minutes
   - Log: `[VERIFY-OTP] OTP expired`

3. **Check for typos**:
   - OTP is case-sensitive
   - Log: `[VERIFY-OTP] Invalid OTP provided`

## Health Check Endpoint

**Endpoint**: `GET /healthcheck`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-14T11:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "services": {
    "database": "connected",
    "email": "configured"
  }
}
```

**Status Values**:
- `ok`: All services operational
- `degraded`: Some services have issues
- `error`: Critical failure

## Environment Variables Required

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client
CLIENT_URL=http://localhost:5173
```

## Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate a new app password for "Mail"
4. Use this password (not your regular Gmail password) in `EMAIL_PASS`

## Monitoring Recommendations

1. **Check logs regularly** for errors
2. **Monitor health endpoint** for service status
3. **Set up alerts** for:
   - Database disconnections
   - Email sending failures
   - High error rates
4. **Track metrics**:
   - OTP success rate
   - Email delivery rate
   - Response times

## Best Practices

1. **Always validate input** before processing
2. **Use try-catch blocks** for async operations
3. **Log errors with context** for debugging
4. **Clean up resources** on failure
5. **Return user-friendly error messages**
6. **Never expose sensitive data** in errors
7. **Use appropriate HTTP status codes**

## Error Utility Functions

Located in `/src/utils/errorHandler.js`:

- `AppError`: Custom error class
- `asyncHandler`: Async error wrapper
- `handleValidationError`: Input validation
- `handleDatabaseError`: Database errors
- `logError`: Structured logging

## Support

If issues persist:
1. Check server logs for detailed errors
2. Verify all environment variables are set
3. Test email service independently
4. Check database connection
5. Review network/firewall settings
