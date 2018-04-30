'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
  require('./admin/users.authentication.server.controller'),
  require('./admin/users.authorization.server.controller'),
  require('./admin/users.password.server.controller'),
  require('./admin/users.profile.server.controller')
);
 