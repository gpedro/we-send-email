# we-send-email

Npm package and Sails hook to send emails with sails.js used on We.js
===========================

With node ```nodemailer``` and ```email-templates```

## How to install

```sh
npm install we-send-email --save
```

And add it in one sails.js hook:

file: ```api/hooks/email/index.js```

```js
module.exports = require('we-send-email').hook;
```

## Usage

```js
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

sails.email.sendEmail(options ,templateName ,templateVariables, cb);

```

## Configuration

> the config file is [project]/config/email.js

See:

* https://github.com/andris9/Nodemailer
* https://github.com/wejs/we

## Credits
[Alberto Souza](https://github.com/albertosouza/)

LICENSE: MIT
