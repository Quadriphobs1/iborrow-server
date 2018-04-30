'use strict';

/**
 * Module dependencies
 */
const borrowerPolicy = require('../policies/borrowers.server.policy'),
  borrower = require('../controllers/borrowers.server.controller');

module.exports = function (app) {
  // Users collection routes
  app.route('/api/borrowers')
    .get(borrowerPolicy.isAllowed, borrower.list);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
