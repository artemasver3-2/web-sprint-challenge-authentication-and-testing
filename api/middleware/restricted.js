const jwt = require('jsonwebtoken');
const secrets = require('../secrets'); 

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'token required' });
  }

  jwt.verify(token, secrets.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'token invalid' });
    }

    req.decodedToken = decoded;
    next();
  });
};
