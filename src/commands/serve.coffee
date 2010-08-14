# Serve the visualization through a local server
SERVER_PORT = 5000
CWD = process.cwd()

express  = require 'express'
connect  = require 'connect'
sys      = require 'sys'
fs       = require 'fs'
Mustache = require '../../lib/mustache'

# Helpers
# ==============================================================================

render = (filename, view) ->
  template = fs.readFileSync(filename, 'utf-8')
  Mustache.to_html(template, view)

app = express.createServer()

# Configuration
# ==============================================================================

app.configure ->
  app.set 'views', CWD + '/views'
  app.use connect.bodyDecoder()
  app.use app.router
  app.use connect.staticProvider(__dirname + '/../../public')


app.configure 'development', ->
  app.use connect.errorHandler({ dumpExceptions: true, showStack: true })


# Routes
# ==============================================================================

app.get '/', (req, res) ->
  manifest = JSON.parse(fs.readFileSync("#{CWD}/manifest.json", 'utf-8'))
  manifest['dir'] = '/files/'
  res.send render("#{__dirname}/../../templates/show.mustache", manifest)


# Serves static files from the current directory
app.get /^\/files\/(.+)$/, (req, res) ->
  res.writeHead(200, {
    'Content-Type': 'text/javascript'
  })
  res.write fs.readFileSync("#{CWD}/#{req.params[0]}", 'utf-8')
  res.end()

app.listen SERVER_PORT

puts 'listening on port 5000...'