# Shellify

[![NPM Version](https://img.shields.io/npm/v/shellify.svg) ![Downloads](https://img.shields.io/npm/dm/shellify.svg)](https://npmjs.org/package/shellify)
[![Build Status](https://img.shields.io/travis/lighterio/shellify.svg)](https://travis-ci.org/lighterio/shellify)
[![Code Coverage](https://img.shields.io/coveralls/lighterio/shellify/master.svg)](https://coveralls.io/r/lighterio/shellify)
[![Dependencies](https://img.shields.io/david/lighterio/shellify.svg)](https://david-dm.org/lighterio/shellify)
[![Support](https://img.shields.io/gratipay/Lighter.io.svg)](https://gratipay.com/Lighter.io/)

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
      note: 'Increments the major, minor or patch version by one',
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

### shellify.mkdirp

A reference to a copy of substack's `mkdirp` module, allowing the same
functionality as `mkdir -p`.
