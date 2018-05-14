'use strict';

/**
 * Module dependencies
 */
const _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  async = require('async'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  validator = require('validator');

exports.members = (req, res, next) => {
    // Check if the user is logged in and valid if not log the user out from the front end
    if (!req.user) {
        return res.status(401).send({
            message: 'User session expired, Please login again'
        });
    }

    let userType = req.params.users // The type of user to fetch
    let perPage = 20 // The number to return per each request
    let page = parseInt(req.params.page) || 1 // The page that we are currently on if not exist make it 1
    let nextPage = null // Add an increment to the current page for the next page

    // Set some object to not returned when selecting
    const usersProjection = {
        __v: false,
        _id: false,
        verified: false,
        created: false,
        updated: false,
        password: false,
        salt: false,
        onboardStatus: false,
        verifiedPhone: false
    }

    User.find({
        "roles.0": userType, // Fetch only for the user type requested
        verified: true
    }, usersProjection)
    .skip((perPage * page) - perPage) // Skip to select the amount per page multiple by the current page and make it 0 @ default
    .limit(perPage)
    .exec((err, users) => {
        User.find({
            "roles.0": userType, // Fetch only for the user type requested
            verified: true
        }).count().exec((err, count) => { // First check the total number of user we can find with out criterion
            if (err) return errorHandler.getErrorMessage(err)
            let pages = Math.ceil(count / perPage) // Get the total pages that we might have
            return res.json({
                user: users,
                current: page,
                pages: pages,
                total: count
             })
    
        })
        
    })
    
    
}