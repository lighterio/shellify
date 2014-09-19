var fs = require('fs');
var spawn = require('child_process').spawn;
var shellify = require('../shellify');
var log = shellify.logger;

var boilerplates = __dirname.replace(/commands$/, 'boilerplates/');

module.exports = function init(options) {

  var cwd = process.cwd().replace(/[\/\\]([^\/\\]+)$/, '/$1/');

  function fail(message) {
    log('Cannot initialize Shellify inside "' + cwd + '".');
    if (message) {
      log.error(message);
    }
    log.warn('Exiting.');
  }

  // If Shellify is already installed and up-to-date, skip to the boilerplatee.
  try {
    var installed = require(cwd + 'node_modules/shellify');
    if (installed.version >= shellify.version) {
      return initBoilerplate();
    }
  }
  catch (e) {}

  // Install this version of Shellify in the current directory.
  log('Installing Shellify...');
  var child = spawn('npm', ['install', '--save', 'shellify@' + shellify.version], {cwd: cwd});

  function writeIndented(data) {
    if (data) {
      if (!child.indent) {
        child.indent = '    ';
        process.stdout.write(child.indent);
      }
      data = ('' + data).replace(/\n/g, '\n' + child.indent);
      process.stdout.write(data);
    }
  }

  child.stdout.on('data', writeIndented);

  child.stderr.on('data', writeIndented);

  child.on('close', function (code) {
    if (code === 0) {
      process.stdout.write('\r');
      log.info('Installed shellify@' + shellify.version);
      initBoilerplate();
    }
    else {
      fail('Could execute "npm install shellify" in "' + cwd + '".');
    }
  });

  function initBoilerplate() {

    var path, json, pkg, src, cli, hasBin;

    // Parse and validate package.json in the current directory.
    path = cwd + 'package.json';
    try {
      json = '' + fs.readFileSync(path);
    }
    catch (e) {
      return fail('Failed to read "' + path + '".');
    }
    try {
      pkg = JSON.parse(json);
    }
    catch (e) {
      return fail('Invalid JSON in "' + path + '".');
    }

    // Make sure package.json has a "name" and "main", and "bin" is absent or correct.
    if (!pkg.name) {
      return fail('There is no "name" property in "' + path + '".');
    }
    if (!pkg.main) {
      return fail('There is no "main" property in "' + path + '".');
    }
    if (pkg.bin) {
      if (typeof pkg.bin == 'string') {
        return fail('There is a non-object "bin" property in "' + path + '".');
      }
      var bin = pkg.bin[pkg.name];
      if (!bin) {
        pkg.bin[pkg.name] = pkg.main;
        json = JSON.stringify(pkg, null, '  ');
        try {
          fs.writeFileSync(path, json);
        }
        catch (e) {
          return fail('Failed to update the package "' + path + '".');
        }
      }
      else if (bin != pkg.main) {
        return fail('The package has a "bin" with "' + pkg.name + '" pointing to "' + bin + '" rather than "' + pkg.main + '".');
      }
    }

    // Create the "commands" directory.
    path = cwd + 'commands';
    try {
      shellify.mkdirp.sync(path);
    }
    catch (e) {
      return fail('Failed to create the commands directory "' + path + '".');
    }

    // Copy the "hello.js" boilerplate command file.
    path = boilerplates + 'commands/hello.js';
    try {
      src = '' + fs.readFileSync(path);
      src = src.replace(/\$\{pkg\.name\}/g, pkg.name);
    }
    catch (e) {
      return fail('Failed to read the hello command "' + path + '".');
    }
    path = cwd + 'commands/hello.js';
    try {
      fs.writeFileSync(path, src);
    }
    catch (e) {
      return fail('Failed to write the hello command "' + path + '".');
    }

    // Get boilerplate code for initializing a shellify CLI.
    path = boilerplates + 'cli.js';
    try {
      cli = '' + fs.readFileSync(path);
    }
    catch (e) {
      return fail('Failed to read the CLI boilerplate "' + path + '".');
    }

    // Get the "main" file contents if it exists. Otherwise, we'll create it.
    path = cwd + pkg.main;
    try {
      src = '' + fs.readFileSync(path);
      if (src.indexOf('#!') === 0) {
        return fail('The main file "' + path + '" already starts with "#!".');
      }
    }
    catch (e) {
    }

    // Append the CLI boilerplate to any existing "main" code, and write it.
    try {
      src = cli + (src ? '\n\n' + src : '');
      fs.writeFileSync(path, src);
    }
    catch (e) {
      return fail('Failed to write the main file "' + path + '".');
    }

    // Make the "bin" file executable, and ignore failures.
    if (process.platform.indexOf('win') !== 0) {
      try {
        fs.chmodSync(path, 0755);
      }
      catch (e) {
        log.error(e);
      }
    }

    // Add the "bin" property to package.json in the current directory.
    if (!pkg.bin) {

    }
    var line = '  "main": "' + pkg.main + '",';
    src = '\n  "bin": {\n    "' + pkg.name + '": "' + pkg.main + '"\n  },';
    json = json.replace(line, line + src);
    path = cwd + 'package.json';
    try {
      fs.writeFileSync(path, json);
    }
    catch (e) {
      return fail('Failed to update the package "' + path + '".');
    }

    log.info('Successfully initialized Shellify in "' + cwd + '".');

  }

};
