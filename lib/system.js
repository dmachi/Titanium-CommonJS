
// -- tlrobinson Tom Robinson

var IO = require("io").IO;

exports.stdin  = Titanium.App.stdin;
exports.stdout = Titanium.App.stdout;
exports.stderr = Titanium.App.stderr

exports.args = Titanium.App.getArguments();

exports.env = {}; /*TODO*/

exports.fs = require('file');

// default logger
var Logger = require("logger").Logger;
exports.log = new Logger(exports.stderr);

