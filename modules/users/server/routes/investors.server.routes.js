'use strict';

/**
 * Module dependencies
 */
const investorsPolicy = require('../policies/investors.server.policy'),
  investors = require('../controllers/investors.server.controller');

module.exports = function (app) {

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
