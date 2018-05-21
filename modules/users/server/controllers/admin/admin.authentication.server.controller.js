'use strict'

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

exports.regAdmin = function(req, res, next) {
  async.waterfall([
    function(done) {
      const user = new User(req.body);
      user.displayName = user.firstName + ' ' + user.lastName;
      user.shortName = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      user.roles  = 'admin';
      user.verified = true
      user.onboardStatus = true
      user.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.send({
            message: 'Account created successfully'
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

exports.addAdmins = function (req, res, next) {
  async.waterfall([
    function (done) {
      const generatedPassword = randomToken(8);
      const user = new User(req.body)
      user.displayName = user.firstName + ' ' + user.lastName;
      user.shortName = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      user.password = generatedPassword
      user.verified = true
      user.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          done(err, user, generatedPassword)
        }
      });
    },
    /**
     * Send the user a message with their password
     */
    function (user, generatedPassword, done) {
      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      var adminUrl = config.admin;
      var loginUrl = `${config.admin}/auth/login`
      res.render(path.resolve('modules/users/server/templates/admin-welcome-email'), {
        name: user.firstName,
        url: adminUrl,
        username: user.username,
        loginUrl: loginUrl,
        password: generatedPassword
      }, function (err, emailHTML) {
        done(err, emailHTML, user, generatedPassword);
      });
    },
    /* function to sent the email to the user account */
    function (emailHTML, user, generatedPassword, done){
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
        subject: 'Your account password',
        html: emailHTML,
        inline: [filenameone, twitter, facebook, linkedin, instagram]
      }

      //Invokes the method to send emails given the above data with the helper library
      mailgun.messages().send(data, function (err, body) {
          if (!err) {
            res.send({
              message: 'Account created successfully and a default password has been sent to the email.',
              user: user,
              password: generatedPassword
            });
          } else {
            return res.status(400).send({
              message: 'Failure sending email'
            });
          }
      });
    }
  ])
}
