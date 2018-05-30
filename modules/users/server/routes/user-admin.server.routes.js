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
  // Sub admin route resource
  app.route('/api/admin/user').all(adminPolicy.isAllowed)
    .post(users.addAdmins)
    .get(users.listUsers)
  
  /**
  * Get all available admins and group them with their roles in counted format
   */
  app.route('/api/admin/users/count').get(users.countAdmins)
  
  app.route('/api/admin/user/:userID').all(adminPolicy.isAllowed)
    .delete(users.deleteUser)
  
  // Finish by binding the user middleware
  app.param('userID', users.userByID); 
};
