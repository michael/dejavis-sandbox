Déjàvis
================================================================================

Déjàvis is a sandbox for data visualizations. It allows you to develop pluggable
visualizations in a declarative style and deploy them to dejavis.org. You no
longer need to start from a plain HTML file. The HTML frame is defined by the
sandbox. You can modify the HTML using placeholders (name, description, author)
which are specified in a `manifest.json` file. Of course you can manipulate the
DOM with Javascript at any time.

![Screenshot](http://github.com/michael/dejavis/raw/master/assets/screenshot.png)


Workflow
--------------------------------------------------------------------------------

The `dejavis` command line utility lets you create, serve and deploy your
visualization.

**1. Create a visualization using a skeleton**

    dejavis create your_vis

This generates a skeleton containing an example visualization. The example is 
written in CoffeeScript, which is really great for writing expressive code in
less lines of code. For the visualization part [Unveil.js](http://github.com/michael/unveil)
is used. However this is just a starting point. You can throw everything away and
use your favorite frameworks.


**2. Adjust manifest.json**

Meta information, like name, description, author are specified here. Also the scripts
that should be loaded need to be set.


**3. Serve it locally and start development**

    dejavis serve
    
    
**4. Publish to dejavis.org**

You need to have your code in a public Github repository in order to deploy your work.
The name property of the manifest.json file needs to be unique as your visualization
will live at http://dejavis.org/your_vis.

    dejavis publish
    
This command isn't implemented yet. Please contact me via Github. I'll publish your visualization manually.

   
Installation
--------------------------------------------------------------------------------

`dejavis` is a command-line utility written in CoffeeScript and running on Node.js.
The included server uses the Express.js web framework.

**Node.js**

    git clone http://github.com/ry/node.git
    ./configure
    make
    make install
    
**CoffeeScript**

    git clone http://github.com/jashkenas/coffee-script.git
    sudo bin/cake install
    
**Express.js**
    
    curl -# http://expressjs.com/install.sh | sh

**Dejavis**

    git clone http://github.com/michael/dejavis.git
    sudo cake install
    

Features
--------------------------------------------------------------------------------

* Create a visualization using a skeleton
* Framework independent
* Local server for development
* Free deployment to dejavis.org
* Compiles .coffee files on the fly while the local server is running
