(function() {
  var Bars, MovingBar;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__superClass__ = parent.prototype;
  }, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  MovingBar = function(properties) {
    uv.Bar.call(this, properties);
    this.th = new uv.Tween({
      obj: this.properties,
      property: 'height',
      duration: 1.5
    });
    return this;
  };
  __extends(MovingBar, uv.Bar);
  MovingBar.prototype.updateHeight = function(h) {
    return this.th.continueTo(h, 1.5);
  };
  MovingBar.prototype.update = function() {
    return this.th.tick();
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
      bar.updateHeight(-parseInt(this.scale(val), 10));
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
          container: $('#canvas'),
          width: 500,
          height: 320,
          zooming: true,
          paning: true
        }
      ]
    });
    this.items = this.collection.all('items');
    return this.items.each(__bind(function(index, item) {
      var bar;
      bar = new MovingBar({
        x: 50 + 35 * index,
        y: 280,
        width: 30,
        height: 0,
        interactive: true
      });
      bar.add(new uv.Label({
        x: 15,
        y: 20,
        width: 30,
        height: 20,
        text: function() {
          return item.identify();
        },
        textAlign: 'center',
        fillStyle: 'black',
        background: true,
        visible: function() {
          return this.parent.active;
        }
      }));
      return this.scene.add(bar);
    }, this));
  };
  Bars.prototype.render = function() {
    return this.scene.start();
  };
  window.Bars = Bars;
  window.MovingBar = MovingBar;
})();
