(function() {
  var Bars;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  Bars = function(_a, _b) {
    this.params = _b;
    this.collection = _a;
    this.build();
    this.update(this.params.property);
    return this;
  };
  Bars.prototype.update = function(property) {
    var colors;
    this.prop = this.collection.get('properties', property);
    this.min = this.prop.aggregate(uv.Aggregators.MIN);
    this.max = this.prop.aggregate(uv.Aggregators.MAX);
    this.scale = pv.Scale.linear(this.min, this.max).range(0, 200).nice();
    colors = pv.Scale.linear(this.min, this.max).range('lightblue', 'darkblue');
    return this.scene.all('children').each(__bind(function(index, bar) {
      var val;
      val = this.items.at(index).value(property);
      bar.animate('height', -parseInt(this.scale(val), 10));
      return bar.p('fillStyle', function() {
        return this.active ? 'orange' : colors(val).color;
      });
    }, this));
  };
  Bars.prototype.build = function() {
    this.scene = new uv.Scene({
      framerate: 30,
      traverser: uv.traverser.BreadthFirst,
      displays: [
        {
          container: 'canvas',
          width: 500,
          height: 320,
          zooming: true,
          paning: true
        }
      ]
    });
    this.items = this.collection.all('items');
    return this.items.each(__bind(function(index, item) {
      return this.scene.add({
        type: 'rect',
        x: 50 + 35 * index,
        y: 280,
        width: 30,
        height: 0,
        interactive: true,
        actors: [
          {
            type: 'label',
            x: 15,
            y: 15,
            width: 30,
            height: 20,
            text: function() {
              return item.identify();
            },
            textAlign: 'center',
            fillStyle: 'black',
            visible: function() {
              return this.parent.active;
            }
          }
        ]
      });
    }, this));
  };
  Bars.prototype.render = function() {
    return this.scene.start();
  };
  window.Bars = Bars;
})();
