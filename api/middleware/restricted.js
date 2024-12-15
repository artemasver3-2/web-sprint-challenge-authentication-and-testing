const jwt = require('jsonwebtoken');
const secrets = require('../secrets');


module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if(token) {
    next()
  } else if (!token) {
    return res.status(401).json({ message: 'token required' });
  } else {
    jwt.verify(token, secrets, (err) => {
      if (err) {
        return res.status(401).json({ message: 'token invalid' });
      }
    });
  }
};
