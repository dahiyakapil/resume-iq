/**
 * Middleware to log all incoming requests for debugging
 */
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log request body for specific routes (excluding sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    
    // Mask sensitive fields
    if (safeBody.password) safeBody.password = '****';
    if (safeBody.otp) safeBody.otp = '****';
    if (safeBody.EMAIL_PASS) safeBody.EMAIL_PASS = '****';
    
    console.log(`[REQUEST BODY]`, JSON.stringify(safeBody, null, 2));
  }

  // Track response
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[RESPONSE] ${method} ${url} - Status: ${res.statusCode}`);
    originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware to track response time
 */
export const responseTimeLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[TIMING] ${req.method} ${req.originalUrl} - ${duration}ms`);
  });
  
  next();
};

/**
 * Middleware to validate required environment variables
 */
export const validateEnvVars = (req, res, next) => {
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS',
    'CLIENT_URL'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('[ENV] Missing environment variables:', missing);
    return res.status(500).json({
      error: 'Server configuration error',
      message: process.env.NODE_ENV === 'development' 
        ? `Missing environment variables: ${missing.join(', ')}`
        : 'Server is not properly configured'
    });
  }

  next();
};
