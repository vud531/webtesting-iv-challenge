const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); //<<<<<<<<<<<<<<<<<<<
const secrets = require('./secrets.js');


const { authenticate } = require('../auth/authenticate');
const db = require('../database/dbConfig')
const Users = db('users')

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

const register= async(req, res, next) => {
  // console.log(req.body)
  try {
    const { username, password } = req.body
    if (username && password) {
      const hash = bcrypt.hashSync(password, 5)
      const [id] = await db('users').insert({username, password: hash})
      console.log(id)
      const token = generateToken({id, username});
      res.status(200).json({
        message: 'Welcome ' + username,
        token
      })
      return;
    } else {
      res.status(400).json({
        error: 'Missing Info. Try Again'
      })
    }
  }
  catch(err) {
    next(err)
  }

  // implement user registration
  // db('users').insert()
}

function login(req, res, next) {
  // implement user login
  const { username, password } = req.body
  db('users')
  .where({username})
  .first()
  .then(user=>{
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user)
      res.status(200).json({
        message: 'Welcome ' + username,
        token
      })
    } else {
      res.status(401).json({ message: 'Invalid Credentials' });
    }
  })
  .catch(err => next(err))

}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}

function generateToken(user) {
  const payload = {
    subject: user.id, // what the token is describing
    username: user.username
  };
  const options = {
    expiresIn: '1h',
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}
