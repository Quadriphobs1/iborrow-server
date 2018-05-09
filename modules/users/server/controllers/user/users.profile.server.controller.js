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
  async = require('async'),
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
      verified: req.user.verified,
      contactInformation: {
        verifiedPhone: req.user.verifiedPhone,
        phoneNumber: req.user.phoneNumber,
        personalInformation: {
          address: req.user.address,
          dob: req.user.dob,
          state: req.user.state
        },
        region: req.user.region
      }
    };
  }
  res.json(safeUserObject || null);
};

exports.personalinfo = (req, res, next) => {
  let user = req.user
  if (user) {
    let personalinfo = req.body

    let birth = new Date(personalinfo.date);
    let now = new Date();
    let beforeBirth = ((() => {birth.setDate(now.getDate());birth.setMonth(now.getMonth()); return birth.getTime()})() < birth.getTime()) ? 0 : 1;
    let age = now.getFullYear() - birth.getFullYear() - beforeBirth;
    if (age > 18) {
      user.address = personalinfo.address
      user.state = personalinfo.state
      user.dob = personalinfo.date

      user.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        return res.send({
          message: 'Information saved successfully'
        });
      });
    } else {

      return res.json({
        valid: false,
        message: 'Age must be greater than 18'
      });
    }
  } else {

    return res.status(401).send({
      message: 'User is not logged in'
    })
  }


}
