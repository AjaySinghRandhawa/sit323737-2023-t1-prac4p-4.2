const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const passport = require('passport');
const passportJwt = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const users = require('./users.json');

// // Set up Passport.js JWT strategy
passport.use(
  new passportJwt.Strategy(
    {
      jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    (payload, done) => {
      // Check if the user ID exists in the JSON file
      const user = users.find(u => u.id === payload.sub);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  )
);

// // Define a local authentication strategy using username and password
passport.use(
  new LocalStrategy((username, password, done) => {
    // Find the user with the matching username and password, in our case we looking for the people in users.json
    const user = users.find(u => u.name === username && u.password === password);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
);

// // Middleware function to require authentication for protected routes
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization; // Get the authorization header
    if (authHeader) { // Check if authorization header exists
      const token = authHeader.split(' ')[1]; // Split to get token
      jwt.verify(token, 'secret', (err, payload) => { // Verify the token
        if (err) {
          res.status(401).json({ error: 'Unauthorized' });
        } else {
          const user = users.find(u => u.id === payload.sub); // Check to find user
          if (user) { // If user exists, store user object and move on to next
            req.user = user;
            next();
          } else { 
            res.status(401).json({ error: 'Unauthorized' });
        
        }
      }});
    } else { 
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  
  
// // Route for /login that accepts username and password
app.get('/login', (req, res) => {

    // Find the user in the JSON file with matching username and password
    const user = users.find(u => u.name === req.query.username && u.password === req.query.password);
  
    if (user) {
      // If the user is found, generate a JWT token with the user's ID
      const token = generateToken(user.id);
      
      // Send the token as a JSON response
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });
  

// Routes for addition, subtraction, multiplication, and division
app.get('/add',  (req, res) => {
  const num1 = parseInt(req.query.num1);
  const num2 = parseInt(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) { // Is not a number check
    res.status(400).send('Invalid input');
  } else {
    const result = num1 + num2;
    res.send(result.toString());
  }
});

app.get('/subtract',  (req, res) => {
  const num1 = parseInt(req.query.num1);
  const num2 = parseInt(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) {
    res.status(400).send('Invalid input');
  } else {
    const result = num1 - num2;
    res.send(result.toString());
  }
});

app.get('/multiply',  (req, res) => {
  const num1 = parseInt(req.query.num1);
  const num2 = parseInt(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) {
    res.status(400).send('Invalid input');
} else {
    const result = num1 * num2;
    res.send(result.toString());
  }
});

app.get('/divide',  (req, res) => {
    const num1 = parseInt(req.query.num1);
    const num2 = parseInt(req.query.num2);
    if (isNaN(num1) || isNaN(num2)) {
        res.status(400).send('Invalid input');
    } else if (num2 === 0) { // Check for divide by 0 err
        res.status(400).send('Cannot divide by zero');
    } else {
        const result = num1 / num2;
        res.send(result.toString());
    }
});


function generateToken(userId) {
    const payload = { sub: userId };
    const options = { expiresIn: '1h' };
    return jwt.sign(payload, 'secret', options);
  }


// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});