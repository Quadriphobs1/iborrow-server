'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./staffs/users.authentication.server.controller'),
  require('./staffs/users.authorization.server.controller'),
  require('./staffs/users.password.server.controller'),
  require('./staffs/users.profile.server.controller')
);
 