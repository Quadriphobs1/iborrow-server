'use strict';

/**
 * Module dependencies
 */
const passport = require('passport');

module.exports = function (app) {
  const welcome = require('../controllers/general.server.controller')
  // User Routes
  var users = require('../controllers/users.server.controller');
  var registerUser = require('../controllers/users.server.controller');

  // TODO: forget password routes

  // Setting up the users authentication api
  app.route('/api/auth/signup/:accountType').post(users.signup);
  app.route('/api/auth/validate/email').post(users.email);
  app.route('/api/auth/validate/username').post(users.username);
  app.route('/api/auth/check/:userId').get(registerUser.userInformation);
  app.route('/api/auth/signin').post(users.signin);
  // Log the user out of the application, this works for all user levels
  app.route('/api/auth/signout').get(users.signout);

  //testing if the app is working in route
  app.route('/api/welcome').get(welcome.welcome);
  app.route('/api/email/:mail').get(welcome.testemail);
};
