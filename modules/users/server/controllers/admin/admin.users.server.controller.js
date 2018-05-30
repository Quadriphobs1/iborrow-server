'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


/**
 * Show all admins to the requesting admin
 */
exports.listUsers = function (req, res, next) {
  User.find({
    'roles': { '$in': ['admin', 'editor', 'moderator', 'consultant']},
    '_id': { '$ne': req.user._id }
  }, '-__v -salt -password -verified -onboardStatus').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(users);
  });
}

/**
 * Get the user information to be displayed
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getUserInfo = function (req, res, next) {
  res.json(req.model);
}

/**
 * Delete a particular user form the list
 */
exports.deleteUser = function (req, res, next) {
  var user = req.model;
  user.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.send({
      message: `${user.username} account deleted successfully.`
    });
  });
}

/**
 * Count available admins and group the result for display to the user
 * @return json(users._id.roles)
 */
exports.countAdmins = function (req, res, next) {
  User.aggregate([
    { "$match": { "roles": { "$in": ['admin', 'editor', 'moderator', 'consultant'] } } },
    {
      $group : {
        _id : "$roles",
        count: { $sum: 1 }
      }
    }
  ], function (err, users) {
    if (err) {
      console.log(err)
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(users);
  });

}


/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '--salt -password -verified -onboardStatus').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};
