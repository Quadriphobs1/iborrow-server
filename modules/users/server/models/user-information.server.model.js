'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator'),
  generatePassword = require('generate-password'),
  owasp = require('owasp-password-strength-test');

owasp.config(config.shared.owasp);


/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * User Schema
 */
var UserInformationSchema = new Schema({
  // used for populating the user
  user: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  phoneNumber: {
    type: String,
    required:  [true,'Please provide your phone number'],
    validate: [validateLocalStrategyProperty, 'Please fill in your phone number']
  },
  address: {
    type: String
  },
  dob: {
    type: Date,
    required:  [true,'Please provide your date of birth'],
    validate: [validateLocalStrategyProperty, 'Please fill in your date of birth']
  },
  state: {
    type: String
  },
  city: {
    type: String,
  },
  region: {
    type: String,
    required:  [true,'You forgot to select your region'],
    validate: [validateLocalStrategyProperty, 'You forgot to select your region']
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For Phone number verification */
  verifiedPhone: {
    type: Boolean,
    default: false
  }
});


mongoose.model('UserInformation', UserInformationSchema);
