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
exports.me = function (req, res) {
  const safeUserObject = null;
  if (req.user) {
    safeUserObject = {
      displayName: validator.escape(req.user.displayName),
      username: validator.escape(req.user.username),
      created: req.user.created.toString(),
      roles: req.user.roles,
      profileImageURL: req.user.profileImageURL,
      email: validator.escape(req.user.email),
      lastName: validator.escape(req.user.lastName),
      firstName: validator.escape(req.user.firstName),
    };
  }

  res.json(safeUserObject || null);
};
