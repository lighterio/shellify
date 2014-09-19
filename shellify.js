#!/usr/bin/env node

// When called directly, run the shellify CLI.
if (process.mainModule.filename == __filename) {
  setImmediate(function () {
    module.parent = module;
    shellify({
      root: __dirname + '/',
      commands: {
        init: {
          note: 'Initializes Shellify boilerplate code in the current working directory',
          options: {}
        }
      }
    });
  });
}

/**
 * Create and return a new CLI.
 */
var shellify = module.exports = function (config) {

  var log = shellify.logger;
  console.log();

  // Remove the extension so that it will match the process args.
  var caller = module.parent.filename.replace(/\..*$/, '');

  // By default, assume the CLI is rooted from where shellify was called,
  // and make sure it ends with a slash.
  config.root = (config.root || caller.replace(/[\/\\][^\/\\]*$/, ''))
                  .replace(/([^\/\\])$/, '$1/');

  config.stdin = config.stdin || process.stdin;
  config.stdout = config.stdout || process.stdout;
  log.stream = config.stdout;

  try {
    config.package = require(config.root + 'package.json');
  }
  catch (e) {
    log.error('No package.json in "' + config.root + '".');
  }

  if (!config.commands) {
    log.error('Shellify config should have a commands object.');
  }

  var name = config.package.name;
  config.commands = JSON.parse('{"help":' + JSON.stringify({
    note: 'Learn about a command with ' + green + name +
      cyan + ' help ' + base + '<command>'
  }) + ',' + JSON.stringify(config.commands).substr(1));

  var args = process.argv;
  var arg = args.shift();
  if (/\bnode$/.test(arg)) {
    args.shift();
  }
  var commandName = args.shift();
  var command = config.commands[commandName];

  if (command) {
    command.name = commandName;
    runCommand(command);
  }
  else {
    if (commandName) {
      console.log(red + 'Unknown command: "' + commandName + '"\n');
    }
    showHelp();
  }

  /**
   * Create a map of options and values by iterating over arguments.
   */
  function addOptionInputs(command, optionObjects) {
    var input = {}; // Named arguments.
    var array = []; // Unnamed arguments.
    var currentKey;
    args.forEach(function (arg) {
      if (arg[0] == '-') {
        currentKey = arg;
        input[currentKey] = true;
      }
      else {
        if (currentKey) {
          input[currentKey] = arg;
        }
        else {
          array.push(arg);
        }
        input[currentKey] = arg;
        currentKey = null;
      }
    });
    for (var key in input) {
      var value = input[key];
      if (key[0] == '-' && key[1] != '-') {
        delete input[key];
        // TODO: Deal with the '-' arg.
        for (var i = 1; i < key.length; i++) {
          input['-' + key[i]] = value;
        }
      }
    }
    command.input = {$: array};
    optionObjects.forEach(function (options) {
      for (var long in options) {
        var short = long[0];
        var defaultValue = options[long].split('|')[1];
        long = long.replace(/_(.)/, function (match, letter) {
          short = letter;
        });
        command.input[long] = input['-' + short] || input['--' + long] || defaultValue;
      }
    });
  }

  function getRequiredInputs(command, optionObjects, callback) {
    var ok = true;
    optionObjects.forEach(function (options) {
      for (var key in options) {
        var prompt = options[key];
      }
    });
    if (ok) {
      callback();
    }
  }

  function runCommand(command) {
    var optionObjects = [command.options, config.options || {}];
    addOptionInputs(command, optionObjects);
    getRequiredInputs(command, optionObjects, function () {

      // TODO: Remove input.input in 1.0.0
      var input = command.input;
      input.input = input.input || input;
      var fn;
      try {
        fn = require(config.root + 'commands/' + commandName);
      }
      catch (e) {
        fn = showHelp;
      }
      fn(input, command, commandName);
    });
  }

  function pad(str, width) {
    var len = Math.max(0, width - str.length);
    return str + Array(len + 1).join(' ');
  }

  function showHelp(input, command, commandName) {
    var commands = config.commands;
    var out = base;

    var width = 0;

    function calculateKeyWidth(map) {
      if (map) {
        for (var key in map) {
          width = Math.max(width, key.length);
        }
      }
    }

    var helpName;
    var helpCommand;
    if (commandName == 'help') {
      helpName = input.$[0];
      helpCommand = commands[helpName];
    }
    if (helpCommand) {
      var options = helpCommand.options;
      calculateKeyWidth(options);
      out += 'Command Usage:\n  ' + green + name + ' ' +
        cyan + helpName +
        base + (width ? ' <options>\n' : '') + '\n';
      if (width) {
        out += 'Options:';
        for (var arg in options) {
          var option = options[arg];
          out += '\n  ' + cyan + '--' + pad(arg, width + 2) +
            grey + option + base;
        }
      }
    }
    else {
      out += 'Usage:\n  ' + green + name +
        cyan + ' <command> ' + base + '<options>\n\n' +
        base + 'Commands:';

      calculateKeyWidth(commands);

      for (var key in commands) {
        out += '\n  ' + cyan + pad(key, width + 2) +
          grey + commands[key].note + base;
      }
    }
    out += '\n';
    console.log(out);
  }

};

/**
 * Expose the version to module users.
 */
shellify.version = require('./package.json').version;

/**
 * Expose a Cedar console logger.
 */
shellify.logger = require('cedar')('console');

/**
 * Expose some simple terminal foreground colors.
 */
var base = shellify.base = '\u001b[39m';
var red = shellify.red = '\u001b[31m';
var yellow = shellify.yellow = '\u001b[33m';
var green = shellify.green = '\u001b[32m';
var cyan = shellify.cyan = '\u001b[36m';
var blue = shellify.blue = '\u001b[34m';
var magenta = shellify.magenta = '\u001b[35m';
var grey = shellify.grey = '\u001b[90m';

/**
 * Expose a copy of substack's mkdirp.
 */
shellify.mkdirp = require('./lib/mkdirp');
