'use strict';

/**
 * Module dependencies
 */
const path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Mailgun = require('mailgun-js'),
  async = require('async'),
  crypto = require('crypto');

const apiKey = config.mailer.apiKey;
const domain = config.mailer.domain;
const from_who = config.mailer.emailFrom;

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (req, res, next) {
  async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by email
    function (token, done) {
      if (req.body.email) {
        User.findOne({
          email: req.body.email.toLowerCase()
        }, '-salt -password', function (err, user) {
          if (err || !user) {
            return res.status(400).send({
              message: 'No account with that email has been found'
            });
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function (err) {
              done(err, token, user);
            }); 
          }
        });
      } else {
        return res.status(422).send({
          message: 'Email field must not be blank'
        });
      }
    },
    // prepare the email template
    function (token, user, done) {
      var resetUrl = `${config.client}/auth/password/reset/${token}`
      res.render(path.resolve('modules/users/server/templates/reset-password-email'), {
        name: user.firstName,
        url: resetUrl
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      const mailgun = new Mailgun({apiKey: apiKey, domain: domain});
      const filenameone = path.resolve('./public/email/logo_100px.png');
      const twitter = path.resolve('./public/email/twitter.png');
      const facebook = path.resolve('./public/email/facebook.png');
      const linkedin = path.resolve('./public/email/linkedin.png');
      const instagram = path.resolve('./public/email/instagram.png');

      const data = {
        //Specify email data
          from: from_who,
        //The email to contact
          to: user.email,
        //Subject and text data  
          subject: 'Your password reset link',
          html: emailHTML,
          inline: [filenameone, twitter, facebook, linkedin, instagram]
        }
  
      //Invokes the method to send emails given the above data with the helper library
      mailgun.messages().send(data, function (err, body) {
          if (!err) {
            res.send({
              message: 'Password reset instructioon has been sent to your email address.'
            });
          } else {
            return res.status(400).send({
              message: 'Failure sending email, try again'
            });
          }
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (err || !user) {
      return res.status(400).send({
        message: 'Invalid token, please try again'
      });
    }

    res.send({
      message: 'Valid token'
    });
  });
};

/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;

  async.waterfall([

    function (done) {
      User.findOne({
        email: req.body.email,
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!err && user) {
          if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
            user.password = passwordDetails.newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                done(err, user);
              }
            });
          } else {
            return res.status(422).send({
              message: 'Passwords do not match'
            });
          }
        } else {
          return res.status(400).send({
            message: 'Password reset token is invalid or has expired.'
          });
        }
      });
    },
    function (user, done) {
      var resetUrl = `${config.client}/auth`
      res.render('modules/users/server/templates/reset-password-confirm-email', {
        name: user.firstName,
        url: resetUrl
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      const mailgun = new Mailgun({apiKey: apiKey, domain: domain});
      const filenameone = path.resolve('./public/email/logo_100px.png');
      const twitter = path.resolve('./public/email/twitter.png');
      const facebook = path.resolve('./public/email/facebook.png');
      const linkedin = path.resolve('./public/email/linkedin.png');
      const instagram = path.resolve('./public/email/instagram.png');

      const data = {
        //Specify email data
          from: from_who,
        //The email to contact
          to: user.email,
        //Subject and text data  
          subject: 'Your password has been changed',
          html: emailHTML,
          inline: [filenameone, twitter, facebook, linkedin, instagram]
        }
  
      //Invokes the method to send emails given the above data with the helper library
      mailgun.messages().send(data, function (err, body) {
          if (!err) {
            res.send({
              message: 'Your password has been successfully changed, you can now proceed to login with your new password'
            });
          } else {
            return res.status(400).send({
              message: 'Failure sending email, try again'
            });
          }
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;

  if (req.user) {
    if (passwordDetails.newPassword) {
      User.findById(req.user.id, function (err, user) {
        if (!err && user) {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;

              user.save(function (err) {
                if (err) {
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  req.login(user, function (err) {
                    if (err) {
                      res.status(400).send(err);
                    } else {
                      res.send({
                        message: 'Password changed successfully'
                      });
                    }
                  });
                }
              });
            } else {
              res.status(422).send({
                message: 'Passwords do not match'
              });
            }
          } else {
            res.status(422).send({
              message: 'Current password is incorrect'
            });
          }
        } else {
          res.status(400).send({
            message: 'User is not found'
          });
        }
      });
    } else {
      res.status(422).send({
        message: 'Please provide a new password'
      });
    }
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};
