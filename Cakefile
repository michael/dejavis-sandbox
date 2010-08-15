# Build script adpated from http://github.com/jashkenas/coffee-script/Cakefile
# ==============================================================================

fs            = require 'fs'
sys           = require 'sys'
CoffeeScript  = require 'coffee-script'
{spawn, exec} = require 'child_process'

# ANSI terminal colors.
red   = '\033[0;31m'
green = '\033[0;32m'
reset = '\033[0m'

# Run a CoffeeScript through the node/coffee interpreter.
run = (args) ->
  proc =         spawn 'bin/coffee', args
  proc.stderr.on 'data', (buffer) -> puts buffer.toString()
  proc.on        'exit', (status) -> process.exit(1) if status != 0

# Log a message with a color.
log = (message, color, explanation) ->
  puts "#{color or ''}#{message}#{reset} #{explanation or ''}"


task 'install', 'Install', ->
  exec "mkdir ~/.node_libraries/"
  exec "cp -rf . ~/.node_libraries/dejavis", (err, stdout, stderr) ->
    throw err if err
  exec "sudo ln -sf ~/.node_libraries/dejavis/bin/dejavis /usr/local/bin/dejavis", (err, stdout, stderr) ->
    throw err if err
  exec "sudo chmod 770 /usr/local/bin/dejavis"
  log "Successfully installed to /usr/local/dejavis", green
  log "Type 'dejavis' for usage of the command line utility."
  