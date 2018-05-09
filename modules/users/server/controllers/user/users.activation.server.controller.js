'use strict';
/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  User = mongoose.model('User'),
  async = require('async'),
  Mailgun = require('mailgun-js'),
  config = require(path.resolve('./config/config')),
  randomToken = require('random-token').create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');


const apiKey = config.mailer.apiKey;
const domain = config.mailer.domain;
const from_who = config.mailer.emailFrom;

/**
 * Check is the activation token is still valid, if yes, activate the account.
 * @param {*} req 
 * @param {*} res 
 */
exports.checkActivationCode = (req, res) => {
    const token = req.body.token;
    async.waterfall([
      // check if the token is valid or not
      function (done) {
        User.findOne({
          emailVerificationToken: token,
          verified: false
        }).exec((err, user) => {
          if (err) return errorHandler.getErrorMessage(err);
      
          // check if verification exist 
          if (user) {
            done(err, user);
          } 
          // send response if the code cannot be found or has expires
          res.status(422).json({
            valid: false,
            message: 'Confirmation code is invalid or has expired. Click resend code above to get new code'
          })
          
        })
      },
      // activate the user account 
      function(user, done) {
        user.verified = true;
        user.emailVerificationToken = undefined;
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
      // TODO: Save a notification to the database for the user
      // prepare to send user a welcome message
      function(user, done) {
        var loginUrl = `${config.client}/auth`;
        res.render(path.resolve('modules/users/server/templates/welcome-user-email'), {
          name: user.firstName,
          username: user.username,
          signinurl: loginUrl
        }, function (err, emailHTML) {
          done(err, emailHTML, user);
        });
      }, 
      // send welcome email to the user here
      function (emailHTML, user, done) {
        var mailgun = new Mailgun({apiKey: apiKey, domain: domain});
        const filenameone = path.resolve('./public/email/logo_100px.png')
        const twitter = path.resolve('./public/email/twitter.png')
        const facebook = path.resolve('./public/email/facebook.png')
        const linkedin = path.resolve('./public/email/linkedin.png')
        const instagram = path.resolve('./public/email/instagram.png')
        const icon1 = path.resolve('./public/email/bigicon7.png')
        const icon2 = path.resolve('./public/email/bigicon6.png')
        const icon3 = path.resolve('./public/email/bigicon2.png')
        var data = {
        //Specify email data
          from: from_who,
        //The email to contact
          to: user.email,
        //Subject and text data  
          subject: 'Welcome to iBorrow',
          html: emailHTML,
          inline: [filenameone, icon1, icon2, icon3, twitter, facebook, linkedin, instagram]
        }

        //Invokes the method to send emails given the above data with the helper library
        mailgun.messages().send(data, function (err, body) {
            if (!err) {
              res.send({
                message: 'You account is now active'
              });
            } else {
              return res.status(400).send({
                message: 'Failure sending email, try again'
              });
            }
        });
      }
    ], (err, success) => {
      if (err) {
        return next(err);
      }
    });
    
    
  };

/**
 * Resend the confirmation code to the user
 * @param {user, header} req 
 * @param { status } res 
 * @param {} next
 */
// TODO: Reconfigure the resent token page
exports.resendCode = (req, res, next) => {
  // Asyncronous waterfall function to run each function after the success of another
  async.waterfall([
    /**
     * create a new token for the user and save the token to the database
     */
    function(done) {
      const generatedToken = randomToken(6);
      const userID = req.user._id;
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
          done(err, verification, req.user);
        }
      });
    },
    /* prepare the email to be sent to the user with the token needed token */
    function(verification, user, done) {
      var clientUrl = config.client;
      res.render(path.resolve('modules/users/server/templates/resend-verification-token-email'), {
        name: user.firstName,
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
        subject: 'Your new verification token',
        html: emailHTML,
        inline: [filenameone, twitter, facebook, linkedin, instagram]
      }

      //Invokes the method to send emails given the above data with the helper library
      mailgun.messages().send(data, function (err, body) {
          if (!err) {
            res.send({
              message: 'Your new verification code has been sent, check your email for confirmation'
            });
          } else {
            return res.status(400).send({
              message: 'Failure sending email, try again'
            });
          }
      });
    }


  ], function (err, success) {
      if (err) {
        return next(err);
      }
  })
}

