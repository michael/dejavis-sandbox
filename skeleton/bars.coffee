# A customized Actor that adds animation to a Bar
class MovingBar extends uv.Bar
  constructor: (properties) ->
    uv.Bar.call(this, properties)
    @th = new uv.Tween({obj: this.properties, property: 'height', duration: 1.5 })
  updateHeight: (h) ->
    @th.continueTo(h, 1.5)
  update: ->
    @th.tick()

class Bars
  constructor: (@collection, @params) ->
    @build()
    @update(@params.property)
  
  update: (property) ->
    @prop = @collection.get('properties', property)
    @min = @prop.aggregate(uv.Aggregators.MIN)
    @max = @prop.aggregate(uv.Aggregators.MAX)
    @scale = pv.Scale.linear(@min, @max).range(0, 200).nice()
    colors = pv.Scale.linear(@min, @max).range('lightblue', 'darkblue')
    
    # Update bar heights
    @scene.all('children').each (index, bar) =>
      val = @items.at(index).value(property)
      bar.updateHeight(-parseInt(@scale(val), 10))
      bar.p 'fillStyle', ->
        if @active then 'orange' else colors(val).color
    
  build: ->
    # create scene
    @scene = new uv.Scene({
          framerate: 30,
          traverser: uv.traverser.BreadthFirst
          displays: [{
            container: $('#canvas'),
            width: 800,
            height: 320,
            zooming: true,
            paning: true
          }]
    })
    
    @items = @collection.all('items')
    @items.each (index, item) =>
      bar = new MovingBar {
        x: 50+35*index
        y: 280
        width: 30
        height: 0
        interactive: true
      }
      
      bar.add new uv.Label {
        x: 15
        y: 20
        width: 30
        height: 20
        text: -> item.identify()
        textAlign: 'center'
        fillStyle: 'black'
        background: true
        visible: -> @parent.active
      }
      @scene.add(bar);

  render: ->
    @scene.start()

# Exports
window.Bars = Bars
window.MovingBar = MovingBar