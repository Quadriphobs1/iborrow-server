'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  passport = require('passport'),
  User = mongoose.model('User'),
  config = require(path.resolve('./config/config'));


/**
 * Signup
 */
exports.signup = function (req, res) {
  /* 
  * DATA STRUTURE:
  * firstName
  * LastName
  * email
  * username
  * password
  * roles
  */
  // For security measurement we remove the roles from the req.body object
  // TODO: Remove the comment from the line below before posting to production
  // delete req.body.roles;
  // Init user and add missing fields
  var user = new User(req.body);
  user.displayName = user.firstName + ' ' + user.lastName;

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // TODO: Send a confirmation email to user after registration
      res.send({
        status: 'Registration Successful, User should receive an email',
        user: user
      })
    }
  });
};

/**
 * Signin user and get the user token for jwt login
 */
exports.signin = function (req, res, next) {
  var usernameOrEmail = req.body.username,
    password = req.body.password;
    // check user loggin paramer with username of email
    // TODO: Fix unhandled error event in this context which is thrown if parameter is wrong from mongodb
    User.findOne({
      $or: [{
        username: usernameOrEmail.toLowerCase()
      }, {
        email: usernameOrEmail.toLowerCase()
      }]
    }, function (err, user) {
      if (err) return errorHandler.getErrorMessage(err);
      if (!user) {
        res.status(503).send({
          message: 'Invalid parameters provided. No user found (' + (new Date()).toLocaleTimeString() + ')'
        })
      }
      if (user && !user.authenticate(password)) {
        res.status(403).send({
          message: 'Invalid parameters provided. Password does not match (' + (new Date()).toLocaleTimeString() + ')'
        })
      }
      if (!user || !user.authenticate(password)) {
        res.status(403).send({
          message: 'Invalid username or password (' + (new Date()).toLocaleTimeString() + ')'
        })
      }
      var payload = {id: user.id};
      // TODO: save token for user into the database
      const expiredTime = 60 * 60 * 24 * 7
      var token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: expiredTime
      });
      res.json({
        message: 'Logged in successfully (' + (new Date()).toLocaleTimeString() + ')',
        user: user,
        token: token
      });
    });
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  // TODO: Destroy token on logout here
  req.logout();
  res.send('user logged out successfully');
};
