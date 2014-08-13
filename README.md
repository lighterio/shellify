# Shellify

[![NPM Version](https://badge.fury.io/js/shellify.png)](http://badge.fury.io/js/shellify)
[![Build Status](https://travis-ci.org/lighterio/shellify.png?branch=master)](https://travis-ci.org/lighterio/shellify)
[![Code Coverage](https://coveralls.io/repos/lighterio/shellify/badge.png?branch=master)](https://coveralls.io/r/lighterio/shellify)
[![Dependencies](https://david-dm.org/lighterio/shellify.png?theme=shields.io)](https://david-dm.org/lighterio/shellify)
[![Support](http://img.shields.io/gittip/zerious.png)](https://www.gittip.com/lighterio/)

Shellify is a module for creating command-line interfaces.

## Example

```javascript
var shellify = require('shellify');

shellify({
  commands: {
    init: {
      note: 'Creates a new package using the Seattle Pub.js Standard',
      options: {
        name: '!Project name (can contain uppercase)',
        author: '!Author name and email|Sam Eubank<sameubank@gmail.com>',
        description: '!Package description'
      },
      alias: 'c'
    },
    space: {
      note: 'Converts tabs to 2 spaces and ensures standard line endings',
      alias: 's'
    },
    version: {
      note: 'Increments a package\'s version just past what\'s published',
      options: {
        number: '?Major, minor or patch|patch'
      },
      alias: 'v'
    },
    publish: {
      note: 'Publishes from the current working directory',
      alias: 'p'
    }
  }
});
```

## API

### shellify(options)

Shellify exports itself as a function, seen in the example above.

### shellify.logger

The Cedar console logger used by shellify, complete with symbols and colors.

### shellify.base

A string that turns your terminal text back to its default color.

### shellify.(red|yellow|green|cyan|blue|magenta|grey)

A string that turns your terminal text red/yellow/green/cyan/blue/magenta/grey.
