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

const whitelistedFields = ['firstName', 'lastName', 'phoneNumber', 'region', 'dob', 'shorname', 'state', 'city', 'address'];


/**
 * Send User
 */
exports.me = (req, res, user) => {
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
      region: req.user.region,
      contactInformation: {
        verifiedPhone: req.user.verifiedPhone,
        phoneNumber: req.user.phoneNumber
      },
      otherInformation: {
        address: req.user.address,
        dob: req.user.dob,
        state: req.user.state,
        city: req.user.city
      },
      onboardStatus: req.user.onboardStatus
    };
  }
  res.json(safeUserObject || null);
};

exports.onboardUpdate = (req, res, next) => {
  let user = req.user;
  if(user) {
    user.onboardStatus = true;
    user.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      return res.send({
        message: 'Onboard Updated Successfully'
      });
    });
  } else {
    return res.status(401).send({
      message: 'User is not logged in'
    })
  }
}

exports.update = (req, res, next) => {
  // Init Variables
  var user = req.user;

  if (user) {
    let birth = new Date(req.body.dateOfBirth);
    let now = new Date(); 
    let beforeBirth = ((() => {birth.setDate(now.getDate());birth.setMonth(now.getMonth()); return birth.getTime()})() < birth.getTime()) ? 0 : 1;
    let age = now.getFullYear() - birth.getFullYear() - beforeBirth;

    if (age > 18) {
      // Update whitelisted fields only
      user = _.extend(user, _.pick(req.body, whitelistedFields));

      user.updated = Date.now();
      user.displayName = user.firstName + ' ' + user.lastName;
      user.shortName = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      user.dob = req.body.dateOfBirth

      user.save((err) => {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.send({
            message: 'Profile update saved successfully'
          });
        }
      });
     
    } else {

      return res.status(422).json({
        valid: false,
        message: 'Age must be greater than 18.'
      });
    }

  } else {
    res.status(401).send({
      message: 'User session expired, Please login again'
    });
  }
}