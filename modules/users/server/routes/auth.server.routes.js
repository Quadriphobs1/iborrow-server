'use strict';

/**
 * Module dependencies
 */
const passport = require('passport');

module.exports = function (app) {
  // Investors registration Routes controller
  const investors = require('../controllers/investors.server.controller');
    const welcome = require('../controllers/general.server.controller')
  // TODO: Setting up the users password api

  // Setting up the users authentication api
  app.route('/api/investors/auth/signup').post(investors.signup);
  app.route('/api/investors/auth/signin').post(investors.signin);
  app.route('/api/investors/auth/signout').get(investors.signout);


  // TODO: Set Routes for other roles and merge common routes together for all roles

  app.route('api/welcome').get(welcome.welcome);
};
