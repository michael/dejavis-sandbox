Déjàvis
================================================================================

Déjàvis is an open repository for hosted visualizations that conform to the 
[Unveil.js Visualization Interface](http://github.com/michael/unveil/blob/master/src/visualization/visualization.js).
The goal is to create a simple platform to share and discuss pluggable 
open source visualizations.

People will be able to submit their own contributions by using a simple Git workflow.


Create and submit your own visualization
--------------------------------------------------------------------------------

This isn't ready yet. However, I just want to outline how the process will work basically.

1. **Start with a [`skeleton`](http://github.com/michael/dejavis-skeleton/). not yet ready!**

   Use this skeleton as a template for your visualizations and put it into a Git repository.
   
2. **Develop your visualization and keep your repo up to date. Just as usual.**

3. **Create a Manifest.**
   
   Your visualization needs to have a manifest.json file in the root directory. All meta-information is stored
   there.
   
        {
          "name": "stacks",
          "title": "Stacks",
          "descr": "Visualizing groups of items",
          "author": "Michael Aufreiter",
          "github_user": "michael",
          "scripts": [
            "protovis.js",
            "artists.js",
            "stacks.js",
            "app.js"
          ],
          "contributors": [
            "Samo Korosec",
            "Martin Gamsjäger"
          ]
        }
   
4. **Submit your work.**

   When you're ready for submission you'll simply need to register the visualization
   by providing the URL of the Git repository.
   
   You'll just need to enter that on the Déjàvis Website,
   which is not online yet. :)