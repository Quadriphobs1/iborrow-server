'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.listUsers = function (req, res, next) {
  User.find({
    'roles': { '$in': ['admin', 'editor', 'moderator', 'consultant']},
    '_id': { '$ne': req.user._id }
  }, '-salt -password -verified -onboardStatus').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
}
