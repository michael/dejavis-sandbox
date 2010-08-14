(function() {
  var BANNER, CoffeeScript, EventEmitter, VERSION, _a, _b, exec, fs, options, parseOptions, path, spawn, sys, usage, version;
  VERSION = "0.0.1";
  fs = require('fs');
  path = require('path');
  sys = require('sys');
  CoffeeScript = require('coffee-script');
  _a = require('child_process');
  spawn = _a.spawn;
  exec = _a.exec;
  _b = require('events');
  EventEmitter = _b.EventEmitter;
  BANNER = 'dejavis utility for creating visualizations\n\nUsage:\n  dejavis create your_vis    # create a new visualization\n  dejavis serve              # serve your visualization locally\n  dejavis publish            # publish your visualization to dejavis.net';
  options = {};
  exports.run = function() {
    parseOptions();
    if (options.create) {
      return require('../dist/commands/create');
    }
    if (options.serve) {
      return require('../dist/commands/serve');
    }
    if (options.publish) {
      return require('../dist/commands/publish');
    }
    if (options.version) {
      return version();
    }
    return usage();
  };
  parseOptions = function() {
    var _c;
    if ((_c = process.argv[2]) === "create") {
      return (options.create = true);
    } else if (_c === "serve") {
      return (options.serve = true);
    } else if (_c === "publish") {
      return (options.publish = true);
    } else if (_c === "--version") {
      return (options.version = true);
    }
  };
  usage = function() {
    puts('\nVisualization creation utility belt\n\nUsage:\n  dejavis create your_vis    # create a new visualization\n  dejavis serve              # serve your visualization locally\n  dejavis publish            # publish your visualization to dejavis.net\n  ');
    return process.exit(0);
  };
  version = function() {
    sys.puts(("Dejavis version " + (VERSION)));
    return process.exit(0);
  };
})();
