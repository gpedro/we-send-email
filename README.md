# we-send-email

We.js email sender machine!
===========================

With node ```nodemailer``` and ```email-templates```

## Installation

```sh
npm install we-send-email --save
```

see https://github.com/wejs/we for config example

## Usage

```js
var weSendEmail = require('we-send-email');

var options = {};
// to email
options.email = 'contato@albertosouza.net';
// sender email
options.from = 'Sender@host.net';

// see https://github.com/niftylettuce/node-email-templates
vat templateName = 'myEmailTemplate';

// some variables to send to you template
var templateVariables = {
  user: {
    name: 'Hihiohir'
  },
  site: {
    name: 'WE',
    slogan: 'MIMI one slogan variable here'
  }
};

weSendEmail.sendEmail(options ,templateName ,templateVariables, cb);

```

## Configuration

See:

* https://github.com/andris9/Nodemailer
* https://github.com/wejs/we

## Credits
[Alberto Souza](https://github.com/albertosouza/)

LICENSE: MIT
