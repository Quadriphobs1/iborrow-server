'use strict';
var passport = require("passport")

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');
  // All routes from this point on need to authenticate with bearer:
  // Authorization: Bearer <token here>
  app.all('*', function(req, res, next) {
    passport.authenticate('jwt', { session: true }) (req, res, next);
  });
  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);

  app.route('/api/user/personalinfo/save').post(users.personalinfo);


};
 