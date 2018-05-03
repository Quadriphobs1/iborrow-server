'use strict';

/**
 * Module dependencies
 */
const _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  validator = require('validator');

const whitelistedFields = ['firstName', 'lastName', 'email', 'username'];


/**
 * Send User
 */
exports.me = function (req, res, user) {
  // Init Variables
  var safeUserObject = null;
  if (req.user) {
    safeUserObject = {
      displayName: req.user.displayName,
      username: req.user.username,
      roles: req.user.roles[0],
      profileImageURL: req.user.profileImageURL,
      email: req.user.email,
      lastName: req.user.lastName,
      firstName: req.user.firstName,
      verified: req.user.verified
    };
  }
  res.json(safeUserObject || null);
};
