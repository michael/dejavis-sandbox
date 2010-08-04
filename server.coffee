express  = require 'express'
connect  = require 'connect'
sys      = require 'sys'
fs       = require 'fs'
Mustache = require './lib/mustache'


# Data (will live within redis in the future)
# ==============================================================================

visualizations = [
  {
    name: 'stacks'
    title: 'Stacks'
  },
  {
    name: 'scatterplot'
    title: 'Scatterplot'
  }
]

collections = [
  {
    name: 'artists'
    title: 'Music Artists'
    uri: 'http://collections.freebaseapps.com/artists'
  }
]

# Helpers
# ==============================================================================


render = (filename, view) ->
  template = fs.readFileSync(filename, 'utf-8')
  Mustache.to_html(template, view)


app = express.createServer()

# Configuration
# ==============================================================================

app.configure ->
  app.set 'views', __dirname + '/views'
  app.use connect.bodyDecoder()
  app.use app.router
  app.use connect.staticProvider(__dirname + '/public')


app.configure 'development', ->
  app.use connect.errorHandler({ dumpExceptions: true, showStack: true })


app.configure 'production', ->
  app.use connect.errorHandler()


# Routes
# ==============================================================================

app.get '/', (req, res) ->    
  view = {visualizations: visualizations}
  res.send render('templates/index.mustache', view)

# Serves collections
app.get '/collections/:collection', (req, res) ->    
  res.send('TODO: Serve a collection')

# Serves static files from the visualization directory
app.get '/files/:vis/:file', (req, res) ->
  res.writeHead(200, {
    'Content-Type': 'text/javascript'
  })
  res.write fs.readFileSync("visualizations/#{req.params.vis}/#{req.params.file}", 'utf-8')
  res.end()

app.get '/:vis', (req, res) ->
  manifest = fs.readFileSync("visualizations/#{req.params.vis}/manifest.json", 'utf-8')
  res.send render('templates/show.mustache', JSON.parse(manifest))

app.listen 3000

