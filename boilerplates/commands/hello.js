/**
 * Usage:
 *   ${pkg.name} hello [options]
 *
 * Options:
 *   -w, --who         Who you would like to say hello to [World]
 */

module.exports = function (input) {
  console.log('Hello ' + input.who + '!');
};
