'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./investors/users.authentication.server.controller'),
  require('./investors/users.authorization.server.controller'),
  require('./investors/users.password.server.controller'),
  require('./investors/users.profile.server.controller')
);
 