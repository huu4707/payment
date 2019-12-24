var nodemailer = require('nodemailer');
var fs = require('fs');
const logger = require('./logger');
const config = require('../config.json')

const TITLE_EMAIL_FORGOT_PASSWORD = `[${config.APP}] - [FORGOT PASSWORD]`;


sendMailTokenResetPassword = function (receiver, username, token) {
  var htmlTemplate = ``
  fs.readFile('template/password_forgot.html', 'utf8', function (err, contents) {
    if (err) {
        logger('sendMailTokenResetPassword').error(err.message);
    } else {
      htmlTemplate = contents
    }
    htmlTemplate = htmlTemplate.replace(/%HOST_SERVER%/gi, config.HOST_SERVER)
    htmlTemplate = htmlTemplate.replace(/%USERNAME%/gi, receiver)
    htmlTemplate = htmlTemplate.replace(/%ACCOUNT%/gi, username)
    htmlTemplate = htmlTemplate.replace(/%TOKEN%/gi, token)

    sendMail(receiver, TITLE_EMAIL_FORGOT_PASSWORD, htmlTemplate, true)


  });
}


sendMail = function (receiver, title, body, html = false) {
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: config.SENDER_EMAIL,
      pass: config.SENDER_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  var mailOptions = {
    from: config.SENDER_EMAIL,
    to: receiver,
    subject: title,
  };
  if (html) {
    mailOptions.html = body
  } else {
    mailOptions.text = body
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
         logger('sendMail').error(error.message); 
    } else {
        logger('sendMail').info('Email sent: ' + info.response); 
    }
  });
}

module.exports = {
    sendMailTokenResetPassword,
}
