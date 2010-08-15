(function() {
  var Mustache, app, collections, connect, express, fs, render, sys, visualizations;
  express = require('express');
  connect = require('connect');
  sys = require('sys');
  fs = require('fs');
  Mustache = require('./lib/mustache');
  visualizations = [
    {
      name: 'stacks',
      title: 'Stacks',
      descr: 'Visualizing groups of items using self-organizing stacks.'
    }, {
      name: 'scatterplot',
      title: 'Scatterplot',
      descr: 'An interactive animated Scatterplot visualization that allows zooming and panning.'
    }
  ];
  collections = [
    {
      name: 'artists',
      title: 'Music Artists',
      uri: 'http://collections.freebaseapps.com/artists'
    }
  ];
  render = function(filename, view) {
    var template;
    template = fs.readFileSync(filename, 'utf-8');
    return Mustache.to_html(template, view);
  };
  app = express.createServer();
  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.use(connect.bodyDecoder());
    app.use(app.router);
    return app.use(connect.staticProvider(__dirname + '/public'));
  });
  app.configure('development', function() {
    return app.use(connect.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  app.configure('production', function() {
    return app.use(connect.errorHandler());
  });
  app.get('/', function(req, res) {
    var view;
    view = {
      visualizations: visualizations
    };
    return res.send(render('templates/index.mustache', view));
  });
  app.get('/collections/:collection', function(req, res) {
    return res.send('TODO: Serve a collection');
  });
  app.get(/^\/files\/(.+)$/, function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'image/png'
    });
    res.write(fs.readFileSync(("visualizations/" + (req.params[0])), 'utf-8'));
    return res.end();
  });
  app.get('/:vis', function(req, res) {
    var manifest;
    manifest = JSON.parse(fs.readFileSync(("visualizations/" + (req.params.vis) + "/manifest.json"), 'utf-8'));
    manifest['dir'] = ("/files/" + (req.params.vis) + "/");
    return res.send(render('templates/show.mustache', manifest));
  });
  app.listen(5001);
})();
