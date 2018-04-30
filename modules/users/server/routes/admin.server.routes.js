'use strict';

/**
 * Module dependencies
 */
const adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // Users collection routes
  app.route('/api/admins')
    .get(adminPolicy.isAllowed, admin.list);

  // Single user routes
  app.route('/api/admins/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
