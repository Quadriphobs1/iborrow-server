'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    uri: 'mongodb://localhost:27017/iborrow-dev'
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  client: 'http://localhost:8081',
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    fileLogger: {
      directoryPath: process.cwd(),
      fileName: 'app.log',
      maxsize: 10485760,
      maxFiles: 2, 
      json: false
    }
  },
  mailer: {
    from: process.env.MAILER_FROM || 'iBorrow',
    apiKey: process.env.MAILGUN_API_KEY || 'key-eb24c1c94ab9dcb7165c7bb0cf9a7eee',
    domain: process.env.MAILGUN_DOMAIN || 'messagecentre.sqtdemo.com.ng',
    emailFrom: process.env.EMAIL_FROM || 'John from iBorrow Team <messagecenter@sqtdemo.com.ng>',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  livereload: true,
  jwt: {
    secret: process.env.JWT_SECRET || 'phobzsqt',
    expiringTime: process.env.JWT_EXPIRING_TIME || '60 * 60 * 24 * 7'
  }
};
 