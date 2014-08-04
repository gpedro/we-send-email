
var weSendEmail = require('../lib/index')
  , should = require('should')
  , sinon = require('sinon')
  , cwd = process.cwd();

function validEmailTransportConfig(){
  return {
    defaultService: 'Mandrill'
    , emailTemplatesFolder: cwd+'/test/fixtures/themes/email/'
    , email: {
      defaultService: 'Mandrill',
      services: {
        Mandrill: {
          service: 'Mandrill',
          type: 'SMTP',
          host: 'smtp.mandrillapp.com',
          port: 587,
          debug: true,
          auth: {
            // test mandrill key
            user: 'alberto.souza.99@gmail.com',
            pass: 'KuOkoKG3FJf5shqsl82xOQ'
          }
        }
      }
    }
  }
}

function emailDebugTransportConfig(){
  return {
    defaultService: null
    , emailTemplatesFolder: cwd+'/test/fixtures/themes/email/'
    , email: {
      defaultService: null,
    }
  }
}

function emailStumb() {
  return {
    email: 'contato@albertosouza.net'
    , subject: 'We.js -> Register validation email.'
    , from: 'testing@wejs.org'
  };
}

// set some sails.js global variables.
GLOBAL.sails = {};
sails.config = {};
sails.config.enviroment = 'prod';

describe('we-send-email', function () {

  it('should send one test email with valid transporter config.', function(done) {

    // valid send email config
    weSendEmail.setConfigs(validEmailTransportConfig());

    var emailType = 'TestEmailTemplate';
    weSendEmail.sendEmail(emailStumb(), emailType,{
      user: { name: 'Alberto Souza' }
      , site: { name: 'WE', slogan: 'MIMI one slogan here' }
      , confirmUrl: 'http://example.org'
    }, function(err, resp) {

      should.not.exist(err);
      should(resp).have.property('rejected', []);
      should(resp).have.properties(['response', 'envelope','messageId']);

      done();
    });

  });

  it('should call debug email function withouth email transporter config.', function(done) {
    weSendEmail.showDebugEmail = sinon.spy();

    weSendEmail.setConfigs(emailDebugTransportConfig());

    var emailType = 'TestEmailTemplate';

    weSendEmail.sendEmail(emailStumb(), emailType,{
      user: { name: 'Alberto Souza' }
      , site: { name: 'WE', slogan: 'MIMI one slogan here' }
      , confirmUrl: 'http://example.org'
    }, function(err, resp) {

      (weSendEmail.showDebugEmail.calledOnce).should.equal(true);

      (weSendEmail.showDebugEmail.args[0]).should.have.length(3);

      should.not.exist(err);
      should.not.exist(resp);

      done();
    });
  });
});