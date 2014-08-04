/**
 * We.js email sender and utils - weSendEmail
 * @author Alberto Souza <contato@albertosouza.net>
 * @license [url] MIT
 */

// theme engine used to get email template folders
var themeEngine = require('we-theme-engine')
 , weSendEmail = {}
// requires
 , nodemailer = require('nodemailer')
//var templatesDir   = path.resolve(__dirname, '..', 'views/mailer');
 , emailTemplates = require('email-templates')
// utils
  , _ = require('lodash');

weSendEmail.configs = {};

weSendEmail.init = function init() {
  // if(configs){
  //  sails.config.email.services
  // }

  // weSendEmail.defaultService = ''

  if ( !_.isUndefined(sails.config.email) )
    if ( !_.isUndefined( sails.config.email.defaultService ) )
      weSendEmail.defaultService = sails.config.email.defaultService;
};

/**
 * Get server transport configs
 * See: nodemailer.createTransport
 * @param  string serviceName email server config name
 */
weSendEmail.getServerTransport = function getServerTransport(serviceName) {
  var emailServerTransport
  , emailServerConfig;
  //console.log(_);
  if (!serviceName) {
    serviceName = weSendEmail.defaultService;
  }

  if (serviceName) {
    emailServerConfig = weSendEmail.getEmailServerConfig;
    if (emailServerConfig) {
      emailServerTransport = nodemailer.createTransport(
        emailServerConfig.type
        , emailServerConfig
      );
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
weSendEmail.sendEmail = function sendEmail(options, templateName, templateVariables, cb) {
  var templatesDir = weSendEmail.getEmailTemplateDir();

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
      if ( sails.config.environment === 'test' || !transport ) {
        weSendEmail.showDebugEmail(options, html, text);
        return cb();
      }

      var email = {
        to: options.email
        , subject: options.subject
        , html: html
        // generateTextFromHTML: true,
        , text: text
      };

      if (options.from) {
        email.from = options.from;
      } else {
        email.from = sails.config.email.from;
      }

      // Send the email
      transport.sendMail(email, function(err, responseStatus) {
        if (err) return cb(err, null);

        return cb(null,responseStatus);
      });
    });
  });
};

weSendEmail.getEmailTemplateDir = function getEmailTemplateDir() {

  var templatesDir = themeEngine.getThemeEmailTemplatesFolder();
  // get email template dir
  if (templatesDir) {
    templatesDir = templatesDir;
  } else {
    templatesDir = sails.config.paths.views + '/mailer';
  }

  return templatesDir;
}

/**
 * Get one email server config
 * @param  {string} serviceName      service name
 * @return {object|null}             object or null
 */
weSendEmail.getEmailServerConfig = function getEmailServerConfig(serviceName) {
  if ( _.isUndefined(sails.config.email.services ) ) {
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
