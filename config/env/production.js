'use strict';

var fs = require('fs');

module.exports = {
    port: process.env.PORT || 8443,
    // Binding to 127.0.0.1 is safer in production.
    host: process.env.HOST || '0.0.0.0',
    db: {
      uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + DB_NAME,
      options: {
        user: '',
        pass: ''
        /**
          * Uncomment to enable ssl certificate based authentication to mongodb
          * servers. Adjust the settings below for your specific certificate
          * setup.
          * for connect to a replicaset, rename server:{...} to replset:{...}
        server: {
          ssl: true,
          sslValidate: false,
          checkServerIdentity: false,
          sslCA: fs.readFileSync('./config/sslcerts/ssl-ca.pem'),
          sslCert: fs.readFileSync('./config/sslcerts/ssl-cert.pem'),
          sslKey: fs.readFileSync('./config/sslcerts/ssl-key.pem'),
          sslPass: '1234'
        }
        */
      },
      // Enable mongoose debug mode
      debug: process.env.MONGODB_DEBUG || false
    },
    log: {
      // logging with Morgan - https://github.com/expressjs/morgan
      // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
      format: process.env.LOG_FORMAT || 'combined',
      fileLogger: {
        directoryPath: process.env.LOG_DIR_PATH || process.cwd(),
        fileName: process.env.LOG_FILE || 'app.log',
        maxsize: 10485760,
        maxFiles: 2,
        json: false
      }
    },
  // configuration setting for mailer in production mode
  mailer: {
    from: process.env.MAILER_FROM || 'Sprngo',
    apiKey: process.env.MAILGUN_API_KEY || 'key-eb24c1c94ab9dcb7165c7bb0cf9a7eee',
    domain: process.env.MAILGUN_DOMAIN || 'messagecentre.sqtdemo.com.ng',
    emailFrom: process.env.EMAIL_FROM || 'messagecenter@sqtdemo.com.ng',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'iborrowsqt'
  }
};
