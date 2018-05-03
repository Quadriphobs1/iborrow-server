'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * User Schema
 */
var VerificationSchema = new Schema({
  userId: {
    type: String,
    required: [true,'User ID is important'],
    validate: [validateLocalStrategyProperty, 'User ID is important']
  },
  token: {
    type: String,
    required:  [true,'Please provide your lastname'],
    validate: [validateLocalStrategyProperty, 'Please fill in your last name']
  },
  tokenExpires: {
    type: Date
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }
});


mongoose.model('Verification', VerificationSchema);
