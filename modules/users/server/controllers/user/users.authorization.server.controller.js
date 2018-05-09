'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  User = mongoose.model('User');


exports.userInformation = function(req, res, next) {
  const email = req.params.email;
  User.findOne({
    email: email
  }).exec(function (err, user) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!user) {
      return res.status(400).send({
        message: 'Cannot find user'
      });
    }
    res.send({
      message: 'User is valid',
      user: user
    });
  });
}

