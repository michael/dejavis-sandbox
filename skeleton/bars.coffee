# A customized Actor that adds animation to a Bar
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
      bar.animate('height', -parseInt(@scale(val), 10))
      bar.p 'fillStyle', ->
        if @active then 'orange' else colors(val).color
    
  build: ->
    # create scene
    @scene = new uv.Scene({
          framerate: 30,
          traverser: uv.traverser.BreadthFirst
          displays: [{
            container: 'canvas',
            width: 500,
            height: 320,
            zooming: true,
            paning: true
          }]
    })
    
    @items = @collection.all('items')
    @items.each (index, item) =>
      @scene.add {
        type: 'rect'
        x: 50+35*index
        y: 280
        width: 30
        height: 0
        interactive: true
        actors: [
          {
            type: 'label',
            x: 15
            y: 15
            width: 30
            height: 20
            text: -> item.identify()
            textAlign: 'center'
            fillStyle: 'black'
            visible: -> @parent.active
          }
        ]
      }

  render: ->
    @scene.start()

# Exports
window.Bars = Bars