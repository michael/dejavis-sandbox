(function() {
  var CWD, NAME, _a, exec, green, log, red, reset, spawn;
  red = '\033[0;31m';
  green = '\033[0;32m';
  reset = '\033[0m';
  log = function(message, color, explanation) {
    return puts(("" + (color || '') + (message) + (reset) + " " + (explanation || '')));
  };
  CWD = process.cwd();
  NAME = process.argv[3];
  _a = require('child_process');
  spawn = _a.spawn;
  exec = _a.exec;
  exec(("mkdir " + (NAME)));
  exec(("cp -r ~/.node_libraries/dejavis/skeleton/* ./" + (NAME)), function(err, stdout, stderr) {
    if (err) {
      throw err;
    }
  });
  log(("Successfully set up skeleton at directory " + (NAME)), green);
})();
