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

  // add new sub admin
  app.route('/api/admin/user').all(adminPolicy.isAllowed)
    .post(users.addAdmins)

  /** Get all users
   * @description List all registered members on the system
   */
  app.route('/api/admin/users/:page([0-9]+)').all(adminPolicy.isAllowed)
    .get(users.listUsers)

  /**
   * Get all available admins and group them with their roles in counted format
   */
  app.route('/api/admin/users/count').get(users.countAdmins)

  app.route('/api/admin/user/:userID').all(adminPolicy.isAllowed)
    .get(users.getUserInfo)
    .delete(users.deleteUser)

  // Finish by binding the user middleware
  app.param('userID', users.userByID);
};
