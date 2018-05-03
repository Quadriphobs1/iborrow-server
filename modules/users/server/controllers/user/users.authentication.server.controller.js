'use strict';

/**
 * Module dependencies
 */
const path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  passport = require('passport'),
  Mailgun = require('mailgun-js'),
  User = mongoose.model('User'),
  Verification = mongoose.model('Verification'),
  config = require(path.resolve('./config/config')),
  async = require('async'),
  crypto = require('crypto'),
  randomToken = require('random-token').create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');


const apiKey = config.mailer.apiKey;
const domain = config.mailer.domain;
const from_who = config.mailer.emailFrom;
/**
 * Signup
 */
exports.signup = function (req, res, next) {
  const accountType = req.params.accountType;
  // check if the user type to register is investor or borrower
  if (accountType=='borrowers' || accountType=='investors') {
    /* Async function to run from top ot bottom all the function, first function register the user, second add the  */
    async.waterfall([
      /* Register the user into the datbase first */
      function(done){
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
        // Init user and add missing fields
        const user = new User(req.body);
        user.displayName = user.firstName + ' ' + user.lastName;
        user.roles  = accountType;
        // Then save the user
        user.save(function (err) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            done(err, user);
          }
        });
      },
      /* Create a verification token for the user and save it into the database */
      function(user, done){
        const generatedToken = randomToken(6);
        const userID = user._id;
        const verification = new Verification({
          userId: userID,
          token: generatedToken,
          tokenExpires: Date.now() + 7200000
        });
        verification.save(function (err) {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            done(err, verification, user);
          }
        });
      },
      /* prepare the email to be sent to the user with the  token needed token */
      function(verification, user, done) {
        var httpTransport = 'http://';
        if (config.secure && config.secure.ssl === true) {
          httpTransport = 'https://';
        }
        var clientUrl = config.client;
        res.render(path.resolve('modules/users/server/templates/verification-token-email'), {
          name: user.firstName,
          appName: config.app.title,
          token: verification.token,
          url: clientUrl
        }, function (err, emailHTML) {
          done(err, emailHTML, user);
        });
      }, 
      /* function to sent the email to the user account */
      function (emailHTML, user, verification, done){
        var mailgun = new Mailgun({apiKey: apiKey, domain: domain});
        const filenameone = path.resolve('./public/email/logo_100px.png')
        const twitter = path.resolve('./public/email/twitter.png')
        const facebook = path.resolve('./public/email/facebook.png')
        const linkedin = path.resolve('./public/email/linkedin.png')
        const instagram = path.resolve('./public/email/instagram.png')
        var data = {
        //Specify email data
          from: from_who,
        //The email to contact
          to: user.email,
        //Subject and text data  
          subject: 'Your verification token',
          html: emailHTML,
          inline: [filenameone, twitter, facebook, linkedin, instagram]
        }
  
        //Invokes the method to send emails given the above data with the helper library
        mailgun.messages().send(data, function (err, body) {
            if (!err) {
              res.send({
                message: 'An email has been sent to the provided email with further instructions.',
                user: user
              });
            } else {
              return res.status(400).send({
                message: 'Failure sending email'
              });
            }
        });
      }
    ], function (err, success) {
        if (err) {
          return next(err);
        }
    });
    
    
  }else {
    return res.status(400).send({
      message: 'Failed to identify account type'
    });
  }
  
  
};

/**
 * Confirm the email does not exist before
 */
exports.email = function (req, res, next) {
  const email = req.body.email;

  User.findOne({
    email: email
  }, function(err, user) {
    if (err) return errorHandler.getErrorMessage(err);
    if(user) {
      return res.json({
        valid: false,
        message: 'There is an account registered with that email address'
      });

    };

    res.json({
      valid: true,
      message: 'No user found'
    })
  });
}

/**
 * Confirm the username does not exist before
 */
exports.username = function (req, res, next) {
  const username = req.body.username;

  User.findOne({
    username: username
  }, function(err, user) {
    if (err) return errorHandler.getErrorMessage(err);
    if(user) {
      return res.json({
        valid: false,
        message: 'Username already exist, try using a unique username'
      });

    };

    res.json({
      valid: true,
      message: 'No user found'
    })
  });
}

/**
 * Signin user and get the user token for jwt login
 */
exports.signin = function (req, res, next) {
  const usernameOrEmail = req.body.username,
    password = req.body.password;
    // check user loggin paramer with username of email
    User.findOne({
      $or: [{
        username: usernameOrEmail.toLowerCase()
      }, {
        email: usernameOrEmail.toLowerCase()
      }]
    }, function (err, user) {
      if (err) return errorHandler.getErrorMessage(err);
      if (!user) {
        return res.status(503).send({ 
          message: 'Invalid parameters provided. No user found (' + (new Date()).toLocaleTimeString() + ')'
        })
      }
      if (user && !user.authenticate(password)) {
        return res.status(403).send({
          message: 'Invalid parameters provided. Password does not match (' + (new Date()).toLocaleTimeString() + ')'
        })
      }
      if (!user || !user.authenticate(password)) {
        return res.status(403).send({ 
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
