'use strict';

/**
 * Module dependencies
 */
const passport = require('passport');

module.exports = function (app) {
  const welcome = require('../controllers/general.server.controller')
  // User Routes
  var users = require('../controllers/users.server.controller');

  // TODO: forget password routes

  // Setting up the users authentication api
  app.route('/api/auth/signup').post(users.signup);
  app.route('/api/auth/signin').post(users.signin);
  // Log the user out of the application, this works for all user levels
  app.route('/api/auth/signout').get(users.signout);

  //testing if the app is working in route
  app.route('/api/welcome').get(welcome.welcome);
};
