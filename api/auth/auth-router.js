const router = require('express').Router();
const User = require('./model');
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken');
const secrets = require('../secrets');

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const taken = await User.findBy({ username: username })
    if (!username || !password) {
      res.status(400).json({
        message: 'username and password required',
      });
    } else if(taken.length) {
      res.status(400).json({
        message: 'username taken',
      });
    } else if (!taken.length) {
      const hashedPassword = bcryptjs.hashSync( password, 8 )
      User.add({ username, password: hashedPassword })
      .then(saved => {
        res.status(201).json(saved)
      })
    }
  } catch(err) {
    next(err)
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password required' });
    }
  
    const user = await User.findBy({ username }).first();
    if (!user) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const passwordValid = bcryptjs.compareSync(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: `welcome, ${user.username}`,
      token,
    });
  } catch(err) {
    next(err)
  }
});

module.exports = router;


function generateToken(user) {
  const payload = {
    subject: user.id, 
    username: user.username,
  };

  const options = {
    expiresIn: '1d',
  };

 
  return jwt.sign(payload, secrets.jwtSecret, options); 
}