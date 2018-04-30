'use strict';

/**
 * Module dependencies
 */
const staffsPolicy = require('../policies/staffs.server.policy'),
  investaffsstors = require('../controllers/staffs.server.controller');

module.exports = function (app) {

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
