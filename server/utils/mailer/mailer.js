/*
 * Copyright (c) Tussock Innovation 2013 Ltd - All rights reserved
 *
 * This file is a part of yflserver.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 */
var nodemailer = require('nodemailer');
var whiskers = require('whiskers');
var defined = agquire('ag/utils/defined');
var fs = require('fs');

// TODO change sending email address
var config = {
    service: 'Gmail',
    auth: {
        user: 'agbaseemailtest@gmail.com',
        pass: 'soOvGTMe/v3YZegjAatc6j8u2uc='
    }
};

var transporter = nodemailer.createTransport(config);

var FROM_ADDRESS = 'AgBase <' + config.auth.user + '>';

var subjects = {
    'system-invite-template': "You're invited to join AgBase",
    'user-password-reset-template': "AgBase Password Reset",
    'signup-farm-invite-template': "You're invited to join AgBase",
    'farm-invite-template': "You've been invited to join a farm"
};

module.exports = {

    loadTemplates: function() {

        var templateDir = __dirname + '/templates/';

        fs.readdirSync(templateDir).forEach(function(name) {
            whiskers.cache[name] = whiskers.compile(fs.readFileSync(templateDir + name));
        });
    },

    sendTemplate: function(to, template, context) {

        var plaintextTemplate = template + '.txt';
        var htmlTemplate = template + '.html';

        var html = whiskers.cache[plaintextTemplate];
        var plaintext = whiskers.cache[htmlTemplate];

        if (!defined(html) && !defined(plaintext)) {
            throw new Error('Unknown email template');
        }

        var subjectTemplate = subjects[template];
        if (!defined(subjectTemplate)) {
            throw new Error('No subject for template: ' + template);
        }

        var htmlRendered = '';
        var textRendered = '';

        if (defined(html)) {
            htmlRendered = whiskers.render(htmlTemplate, context);
        }
        if (defined(plaintext)) {
            textRendered = whiskers.render(plaintextTemplate, context);
        }

        var mailOptions = {
            from: FROM_ADDRESS,
            to: to,
            subject: whiskers.render(subjectTemplate, context),
            text: textRendered,
            html: htmlRendered
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    }
};