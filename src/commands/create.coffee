# Create a visualization from a skeleton

# ANSI terminal colors.
red   = '\033[0;31m'
green = '\033[0;32m'
reset = '\033[0m'

# Log a message with a color.
log = (message, color, explanation) ->
  puts "#{color or ''}#{message}#{reset} #{explanation or ''}"  

CWD = process.cwd()
NAME = process.argv[3]

{spawn, exec} = require 'child_process'

exec "mkdir #{NAME}"
exec "cp -r ~/.node_libraries/dejavis/skeleton/* ./#{NAME}", (err, stdout, stderr) ->
  throw err if err
  
log "Successfully set up skeleton at directory #{NAME}", green