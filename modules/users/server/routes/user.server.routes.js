'use strict';
var passport = require("passport")

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);

  // TODO: create a middleware to get the user's ID from all route included and check if the user if valid or not
};
