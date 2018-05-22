'use strict';

/**
 * Module dependencies
 */
const passport = require('passport'),
    users = require('../controllers/admin.server.controller'),
    adminPolicy = require('../policies/admin.server.policy')

module.exports = function (app) {
  // Admin Routes
  // Authorization: Bearer <token here>
  app.all('*', function(req, res, next) {
    passport.authenticate('jwt', { session: true }) (req, res, next);
  });
  // sub admins route
  app.route('/api/admin/user').all(adminPolicy.isAllowed)
    .post(users.addAdmins)
    .get(users.listUsers)
};
