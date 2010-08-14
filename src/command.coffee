VERSION = "0.0.1"

# External dependencies.
fs             = require 'fs'
path           = require 'path'
sys            = require 'sys'
CoffeeScript   = require 'coffee-script'
{spawn, exec}  = require 'child_process'
{EventEmitter} = require 'events'


# The help banner that is printed when `coffee` is called without arguments.
BANNER = '''
  dejavis utility for creating visualizations

  Usage:
    dejavis create your_vis    # create a new visualization
    dejavis serve              # serve your visualization locally
    dejavis publish            # publish your visualization to dejavis.net
         '''


# Top-level objects shared by all the functions.
options = {}


# Run `coffee` by parsing passed options and determining what action to take.
# Many flags cause us to divert before compiling anything. Flags passed after
# `--` will be passed verbatim to your script as arguments in `process.argv`
exports.run = ->
  parseOptions()
  return require('../dist/commands/create') if options.create
  return require('../dist/commands/serve') if options.serve
  return require('../dist/commands/publish') if options.publish
  return version() if options.version
 
  return usage()
  

# watch = (source, base) ->
#   fs.watchFile source, {persistent: true, interval: 500}, (curr, prev) ->
#     return if curr.mtime.getTime() is prev.mtime.getTime()
#     fs.readFile source, (err, code) -> compileScript(source, code.toString(), base)



parseOptions = ->
  
  switch process.argv[2]
    when "create" then options.create = true
    when "serve" then options.serve = true
    when "publish" then options.publish = true
    when "--version" then options.version = true
  

# Print the usage message and exit.
usage = ->
  puts '''
  
  Visualization creation utility belt

  Usage:
    dejavis create your_vis    # create a new visualization
    dejavis serve              # serve your visualization locally
    dejavis publish            # publish your visualization to dejavis.net
    
  '''
  process.exit 0

# Print the `--version` message and exit.
version = ->
  sys.puts "Dejavis version #{VERSION}"
  process.exit 0
