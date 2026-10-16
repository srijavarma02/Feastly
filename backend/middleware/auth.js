const jwt = require('jsonwebtoken');

/**
 * requireAuth — validates Bearer JWT from Authorization header.
 * Attaches decoded payload to req.user on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * requireManager — must be used AFTER requireAuth.
 * Checks that the authenticated user has role === 'manager'.
 */
function requireManager(req, res, next) {
  if (!req.user || req.user.role !== 'manager') {
    return res.status(403).json({ success: false, error: 'Access denied. Manager role required.' });
  }
  next();
}

module.exports = { requireAuth, requireManager };
