'use strict';

/**
 * Module dependencies
 */
const passport = require('passport');

module.exports = function (app) {
  // Admin Routes
  var users = require('../controllers/admin.server.controller');

  // Register an admin account. This route can only be accessed by testing operator
  app.route('/api/admin/create')
    .post(users.regAdmin);

  // sub admins route
  app.route('/api/admin/user').post(users.addAdmins)
};
