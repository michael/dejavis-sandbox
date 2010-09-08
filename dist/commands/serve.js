(function() {
  var CWD, Mustache, SERVER_PORT, _a, app, connect, exec, express, fs, jsl, printIt, render, spawn, sys;
  SERVER_PORT = 5000;
  CWD = process.cwd();
  express = require('express');
  connect = require('connect');
  sys = require('sys');
  fs = require('fs');
  Mustache = require('../../lib/mustache');
  _a = require('child_process');
  spawn = _a.spawn;
  exec = _a.exec;
  render = function(filename, view) {
    var template;
    template = fs.readFileSync(filename, 'utf-8');
    return Mustache.to_html(template, view);
  };
  app = express.createServer();
  app.configure(function() {
    app.set('views', CWD + '/views');
    app.use(connect.bodyDecoder());
    app.use(app.router);
    return app.use(connect.staticProvider(__dirname + '/../../public'));
  });
  app.configure('development', function() {
    return app.use(connect.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  app.get('/', function(req, res) {
    var manifest;
    manifest = JSON.parse(fs.readFileSync(("" + (CWD) + "/manifest.json"), 'utf-8'));
    manifest['dir'] = '/files/';
    return res.send(render(("" + (__dirname) + "/../../templates/show.mustache"), manifest));
  });
  app.get(/^\/files\/(.+)$/, function(req, res) {
    res.writeHead(200, {
      'Content-Type': req.params[0].indexOf('css') >= 0 ? 'text/css' : 'text/javascript'
    });
    res.write(fs.readFileSync(("" + (CWD) + "/" + (req.params[0])), 'utf-8'));
    return res.end();
  });
  printIt = function(buffer) {
    return puts(buffer.toString().trim());
  };
  jsl = spawn('coffee', ['-wc', '.'], {
    cwd: CWD
  });
  jsl.stdout.on('data', printIt);
  jsl.stderr.on('data', printIt);
  jsl.stdin.end();
  app.listen(SERVER_PORT);
  puts('listening on port 5000...');
})();
