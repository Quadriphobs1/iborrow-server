'use strict';

/**
 * Module dependencies.
 */
const config = require('../config'),
    mongoose = require('./mongoose'),
    express = require('./express'),
    chalk = require('chalk');



// Initialize Models
mongoose.loadModels();

module.exports.init = function init(callback) {
  mongoose.connect(function (db) {
    // Initialize express
    var app = express.init(db);
    if (callback) callback(app, db, config);

  });
};

module.exports.start = function start(callback) {
  var _this = this;

  _this.init(function (app, db, config) {

    // Start the app by listening on <port> at <host>
    app.listen(config.port, config.host, () => {
      // Create server URL
      var server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
      // Logging initialization
      console.log('--');
      console.log(chalk.green(config.app.title));
      console.log();
      console.log(chalk.green('Environment:     ' + process.env.NODE_ENV));
      console.log(chalk.green('Server:          ' + server));
      console.log(chalk.green('Database:        ' + config.db.uri));
      console.log(chalk.green('App version:     ' + config.iborrowjs.version));
      if (config.iborrowjs['iborrow-version'])
        console.log(chalk.green('iBorrow.JS version: ' + config.iborrowjs['iborrow-version']));
      console.log('--');

      if (callback) callback(app, db, config);
    });

  });

};
