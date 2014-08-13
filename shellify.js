/**
 * Create and return a new CLI.
 */
var shellify = module.exports = function (config) {

  var log = shellify.logger;

  // Remove the extension so that it will match the process args.
  var caller = module.parent.filename.replace(/\..*$/, '');

  // By default, assume the CLI is rooted from where shellify was called.
  config.root = config.root || caller.replace(/[\/\\][^\/\\]*$/, '/');

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
    note: 'Learn about a command with ' + shellify.green + name +
      shellify.cyan + ' help ' + shellify.base + '<command>'
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
      log.error('Unknown command: "' + commandName + '".\n');
    }
    showHelp();
  }

  function addOptionInputs(command, optionObjects) {
    var input = {};
    var key = name;
    args.forEach(function (arg) {
        if (arg[0] == '-') {
          key = arg;
          input[key] = true;
        }
        else {
          input[key] = arg;
          key = commandName;
        }
    });
    for (key in input) {
      var value = input[key];
      if (key[0] == '-' && key[1] != '-') {
        delete input[key];
        // TODO: Deal with the '-' arg.
        for (var i = 1; i < key.length; i++) {
          input['-' + key[i]] = value;
        }
      }
    }
    command.input = {};
    optionObjects.forEach(function (options) {
      for (long in options) {
        var short = long[0];
        long = long.replace(/_(.)/, function (match, letter) {
          short = letter;
        });
        command.input[long] = input['-' + short] || input['--' + long];
      }
    });
  }

  function getRequiredInputs(command, optionObjects, callback) {
    var ok = true;
    optionObjects.forEach(function (options) {
      for (key in options) {
        var prompt = options[key];
        log.warn(prompt);
      }
    });
    if (ok) {
      callback();
    }
  }

  function runCommand(command) {
    var optionObjects = [command.options, config.options || {}]
    addOptionInputs(command, optionObjects);
    getRequiredInputs(command, optionObjects, function () {
      if (commandName == 'help') {
        showHelp();
      }
      else {
        require(config.root + 'commands/' + commandName)(command);
      }
    });
  }

  function pad(str, width) {
    var len = Math.max(0, width - str.length);
    return str + Array(len + 1).join(' ');
  }

  function showHelp() {
    var width = 0;
    for (var command in config.commands) {
      width = Math.max(width, command.length);
    }
    width += 2;
    var help = 'Usage: ' + shellify.green + name +
      shellify.cyan + ' <command> ' + shellify.base + '<options>\n';
    for (key in config.commands) {
      help += '\n  ' + shellify.cyan + pad(key, width) +
        shellify.grey + config.commands[key].note + shellify.base;
    }
    help += '\n';
    log(help);
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

shellify.base = '\u001b[39m';
shellify.red = '\u001b[31m';
shellify.yellow = '\u001b[33m';
shellify.green = '\u001b[32m';
shellify.cyan = '\u001b[36m';
shellify.blue = '\u001b[34m';
shellify.magenta = '\u001b[35m';
shellify.grey = '\u001b[90m';
