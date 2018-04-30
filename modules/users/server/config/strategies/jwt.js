'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  jwt = require('jsonwebtoken'),
  passportJWT = require('passport-jwt'),
  User = require('mongoose').model('User'),
  path = require('path'),
  config = require(path.resolve('./config/config'));

//SET IP JWT PASSPORT
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = config.jwt.secret

module.exports = function () {
  passport.use(new JwtStrategy(jwtOptions,
  function (jwt_payload, next) {
    var id = jwt_payload.id
    User.findById(id, function (err, user) {
      if (err) {
        next(null, false);
      }
      if (!user) {
        next(null, false);
      }
      next(null, user);
    });
  }));
};
