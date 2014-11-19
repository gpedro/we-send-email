/**
 * We.js email sender and utils - weSendEmail
 * @author Alberto Souza <contato@albertosouza.net>
 * @license [url] MIT
 */

// theme engine used to get email template folders
var weSendEmail = {}
// requires
 , nodemailer = require('nodemailer')
 , smtpTransport = require('nodemailer-smtp-transport')
//var templatesDir   = path.resolve(__dirname, '..', 'views/mailer');
 , emailTemplates = require('email-templates')
// utils
  , _ = require('lodash')
  , fs = require('fs')
  , configs = {};

if (GLOBAL.sails) {
  weSendEmail.defaultService = sails.config.email.defaultService;
}

weSendEmail.setConfigs = function setConfigs(cfgs) {
  if (cfgs) {
    weSendEmail.defaultService = cfgs.defaultService;
    configs = cfgs;
  } else {
    weSendEmail.defaultService = sails.config.email.defaultService;
    configs.email = sails.email;
  }

  if (sails){
    // if one email tempate dont exists then use one fallback
    configs.fallbackEmailTemplateFolder = sails.config.paths.fallbackEmailTemplateFolder;
  }

};

function getEmailTemplatesFolder() {
  if (configs.emailTemplatesFolder) {
    return configs.emailTemplatesFolder;
  }

  return sails.themes.active.getThemeEmailTemplatesFolder();
}

/**
 * Get server transport configs
 * See: nodemailer.createTransport
 * @param  string serviceName email server config name
 * @todo  add suport to more transports than SMTP transports types
 */
weSendEmail.getServerTransport = function getServerTransport(serviceName) {
  var emailServerTransport
  , emailServerConfig;

  if (!serviceName) {
    serviceName = weSendEmail.defaultService;
  }

  if (serviceName) {
    emailServerConfig = weSendEmail.getEmailServerConfig(serviceName);
    if (emailServerConfig) {
      emailServerTransport = nodemailer.createTransport(smtpTransport(emailServerConfig
      ));
    }
  }

  return emailServerTransport;
};

/**
 * Send one email with configs set in sails configs
 * @param  {object}   options              options on format: {email: 'toemail@exam.c', subject: 'email subject'}
 * @param  {string}   templateName         email template name
 * @param  {object}   templateVariables    variables to send to template
 * @param  {Function} cb                   after ends call cb( error, responseStatus);
 */
weSendEmail.sendEmail = function sendEmail(options, templateName, templateVariables, cb, defaultEmailTemplateDir) {
  var templatesDir = weSendEmail.getEmailTemplateDir(templateName);
  if (!templatesDir) {
    templatesDir = defaultEmailTemplateDir;
  }

  // load email template
  emailTemplates(templatesDir, function(err, template) {
    if (err) return cb(err, null);

    // ## Send a single email

    // Prepare nodemailer transport object
    var transport = weSendEmail.getServerTransport();

    // Send a single email
    template(templateName, templateVariables, function(err, html, text) {
      if (err) return cb(err, null);

      // if are in test enviroment or transport not found in configs
      // print email on console
      if ( sails.config.environment === 'test' ||
       !transport ||
        weSendEmail.defaultService === 'test'
      ) {
        weSendEmail.showDebugEmail(options, html, text);
        return cb();
      }

      var email =
      {
          to: options.email
        , subject: options.subject
        , html: html
        // generateTextFromHTML: true,
        , text: text
      };

      if (options.from) {
        email.from = options.from;
      } else {
        email.from = configs.siteEmail;
      }

      // Send the email
      transport.sendMail(email, function(err, responseStatus) {
        if (err) return cb(err, responseStatus);

        return cb(null,responseStatus);
      });
    });
  });
};

weSendEmail.getEmailTemplateDir = function getEmailTemplateDir(templateName) {

  var templatesDir = getEmailTemplatesFolder();
  // get email template dir
  if (templatesDir) {
    templatesDir = templatesDir;
  } else {
    templatesDir = sails.config.paths.views + '/mailer';
  }

  // TODO make this file check async
  if ( !fs.existsSync(templatesDir + '/' + templateName) ) {
    templatesDir = configs.fallbackEmailTemplateFolder;
  }

  return templatesDir;
}

/**
 * Get one email server config
 * @param  {string} serviceName      service name
 * @return {object|null}             object or null
 */
weSendEmail.getEmailServerConfig = function getEmailServerConfig(serviceName) {

  if (configs.email && configs.email.services) {
    if (configs.email.services[serviceName]) {
      return configs.email.services[serviceName];
    }
  } else if ( _.isUndefined(sails.config.email.services) ) {
    sails.log.error('Email services not found in config');
    return null;
  }

  if ( _.isUndefined( sails.config.email.services[serviceName] ) ) {
    sails.log.error('Email service not found in config check if sails.config.email.services[serviceName exists');
    return null;
  }

  return sails.config.email.services[serviceName];
}

/**
 * Show email on terminal - to tests and if dont have a email server configured
 */
weSendEmail.showDebugEmail = function showDebugEmail (options, html, text) {
  // dont send emails in test enviroment
  sails.log.debug('---- weSendEmail.showDebugEmail ----');
  sails.log.debug('---- Email options: ----');
  sails.log.info(options);
  sails.log.debug('---- Displaying the html email that would be sent ----');
  sails.log.info('HTML:\n',html);
  sails.log.debug('---- Displaying the text email that would be sent ----');
  sails.log.info('text:\n',text);
  sails.log.debug('----------------------------- END --------------------------');
};

//exports it!
module.exports = weSendEmail;
