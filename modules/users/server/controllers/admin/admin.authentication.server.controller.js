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
      user.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.send({
            message: 'Account create successfully'
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
