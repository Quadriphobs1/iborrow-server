'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findOne({
    _id: id
  }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load User ' + id));
    }

    req.profile = user;
    next();
  });
};


exports.userInformation = function(req, res, next) {
  const id = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findOne({
    _id: id
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
