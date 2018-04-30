'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./borrowers/users.authentication.server.controller'),
  require('./borrowers/users.authorization.server.controller'),
  require('./borrowers/users.password.server.controller'),
  require('./borrowers/users.profile.server.controller')
);
 