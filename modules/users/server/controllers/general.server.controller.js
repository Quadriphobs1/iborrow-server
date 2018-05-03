const Mailgun = require('mailgun-js'),
    path = require('path')
    config = require(path.resolve('./config/config'));

const apiKey = config.mailer.apiKey;
const domain = config.mailer.domain;
const from_who = config.mailer.emailFrom;

/**
 * Testing non protected route
 */
exports.welcome = function (req, res) {
    res.send('You are welcome to this routes here')
};

exports.testemail = function(req, res) {
    console.log(apiKey);
    console.log(domain);
    console.log(from_who);
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun({apiKey: apiKey, domain: domain});

    var data = {
    //Specify email data
      from: from_who,
    //The email to contact
      to: req.params.mail,
    //Subject and text data  
      subject: 'Hello from Mailgun',
      html: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! <a href="http://0.0.0.0:3030/validate?' + req.params.mail + '">Click here to add your email address to a mailing list</a>'
    }

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            res.send(err);
            console.log("got an error: ", err);
        }
        //Else we can greet    and leave
        else {
            //Here "submitted.jade" is the view file for this landing page 
            //We pass the variable "email" from the url parameter in an object rendered by Jade
            res.send({
                'submitted': req.params.mail 
            });
        }
    });
}