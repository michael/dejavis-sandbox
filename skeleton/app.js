(function() {
  var renderSettings;
  renderSettings = function(c) {
    var $settings, options, props;
    props = c.all('properties').select(function(key, p) {
      return p.type === 'number' && p.unique;
    });
    options = '';
    props.each(function(index, p) {
      return options += ("<option value=\"" + (p.key) + "\">" + (p.name) + "</option>");
    });
    $settings = $('<h3>Property</h3><select id="property">' + options + '</select>');
    return $('#sidebar').append($settings);
  };
  $(function() {
    var c, vis;
    c = new uv.Collection(countries_fixture);
    renderSettings(c);
    vis = new Bars(c, {
      property: 'life_expectancy_male'
    });
    vis.render();
    return $('#property').change(function() {
      return vis.update($(this).val());
    });
  });
})();
