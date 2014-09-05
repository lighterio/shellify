#!/usr/bin/env node

// When running directly, start the CLI.
if (process.mainModule == module) {

  var shellify = require('shellify');
  shellify({
    commands: {
      hello: {
        note: 'Prints "Hello World" to the console',
        options: {
          who: 'Who to say hello to|World',
          alias: 'w'
        }
      }
    }
  });

}
