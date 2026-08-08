const jwt = require('jsonwebtoken');

function getSecret() {
  return process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'vn-production-secret-key-2026';
}

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, getSecret());
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
