(function( window, undefined ) {
// Top level namespace
var uv = {};

// CONSTANTS
uv.EPSILON = 0.0001;
uv.MAX_FLOAT   = 3.4028235e+38;
uv.MIN_FLOAT   = -3.4028235e+38;
uv.MAX_INT     = 2147483647;
uv.MIN_INT     = -2147483648;
uv.PI          = Math.PI;
uv.TWO_PI      = 2 * uv.PI;
uv.HALF_PI     = uv.PI / 2;
uv.THIRD_PI    = uv.PI / 3;
uv.QUARTER_PI  = uv.PI / 4;
uv.DEG_TO_RAD  = uv.PI / 180;
uv.RAD_TO_DEG  = 180 / uv.PI;


Object.extend = function (f) {
  function G() {}
  G.prototype = f.prototype || f;
  return new G();
};


Object.create = function (o) {
  function F() {}
  F.prototype = o;
  return new F();
};


Object.keys = function (obj) {
  var array = [],
      prop;
  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      array.push(prop);
    }
  }
  return array;
};


function Class(proto) {
  var self = this,
      isSubclass = typeof this === 'function',
      Class = proto.hasOwnProperty('constructor')
        ? proto.constructor
        : isSubclass 
          ? (proto.constructor = function(){ self.apply(this, arguments) })
          : (proto.constructor = function(){})
  if (proto.hasOwnProperty('extend'))
    extend(Class, proto.extend)
  Class.prototype = proto
  Class.extend = arguments.callee
  if (isSubclass) {
    Class.prototype.__proto__ = this.prototype
    if ('extended' in this)
      this.extended(Class)
  }
  return Class
}

Class.prototype = Function.prototype

Class.prototype.include = function(proto){
  extend(this.prototype, proto)
  if ('included' in proto) proto.included(this)
  return this
}

function extend(a, b) {
  for (var key in b)
    if (b.hasOwnProperty(key))
      a[key] = b[key]
}

// SortedHash
// =============================================================================

// Constructor
// Initializes a Sorted Hash
uv.SortedHash = function (data) {
  var that = this;
  this.data = {};
  this.keyOrder = [];
  this.length = 0;
  
  if (data instanceof Array) {
    $.each(data, function(index, datum) {
      that.set(index, datum);
    });
  } else if (data instanceof Object) {
    $.each(data, function(key, datum) {
      that.set(key, datum);
    });
  }
};


// Returns a copy of the sorted hash
// Used by transformation methods
uv.SortedHash.prototype.clone = function () {
  var copy = new uv.SortedHash();
  copy.length = this.length;
  $.each(this.data, function(key, value) {
    copy.data[key] = value;
  });
  copy.keyOrder = this.keyOrder.slice(0, this.keyOrder.length);
  return copy;
};

// Set a value at a given key
// Parameters:
//   * key [String]
uv.SortedHash.prototype.set = function (key, value) {
  if (key === null || key === undefined)
    return this;
  if (!this.data[key]) {
    this.keyOrder.push(key);
    this.length += 1;
  }
  this.data[key] = value;
  return this;
};

// Get value at given key
// Parameters:
//   * key [String]
uv.SortedHash.prototype.get = function (key) {
  return this.data[key];
};

// Remove entry at given key
// Parameters:
//   * key [String]
uv.SortedHash.prototype.del = function (key) {
  // return this.data[key];
  if (this.data[key]) {
    this.keyOrder.splice($.inArray(key, this.keyOrder), 1);
    delete this.data[key];
    this.length -= 1;    
  }
  return this;
};

// Get value at given index
// Parameters:
//   * index [Number]
uv.SortedHash.prototype.at = function (index) {
  var key = this.keyOrder[index];
  return this.data[key];
};

// Get first item
uv.SortedHash.prototype.first = function () {
  return this.at(0);
};

// Get last item
uv.SortedHash.prototype.last = function () {
  return this.at(this.length-1);
};

// Returns for an index the corresponding key
// Parameters:
//   * index [Number]
uv.SortedHash.prototype.key = function (index) {
  return this.keyOrder[index];
};

// Iterate over values contained in the SortedHash
// Parameters:
//   * [Function] 
uv.SortedHash.prototype.each = function (f) {
  var that = this;
  $.each(this.keyOrder, function (index, key) {
    f.call(that, index, that.data[key]);
  });
  return this;
};

// Iterate over values contained in the SortedHash
// Parameters:
//   * [Function] 
uv.SortedHash.prototype.eachKey = function (f) {
  var that = this;
  $.each(this.keyOrder, function (index, key) {
    f.call(that, key, that.data[key]);
  });
  return this;
};


// Convert to an ordinary JavaScript Array containing
// the values
// 
// Returns:
//   * Array of items
uv.SortedHash.prototype.values = function () {
  var result = [];
  this.eachKey(function(key, value) {
    result.push(value);
  });
  return result;
};

// Convert to an ordinary JavaScript Array containing
// key value pairs — used for sorting
// 
// Returns:
//   * Array of key value pairs
uv.SortedHash.prototype.toArray = function () {
  var result = [];
  
  this.eachKey(function(key, value) {
    result.push({key: key, value: value});
  });
  
  return result;
};


// Map the SortedHash to your needs
// Parameters:
//   * [Function] 
uv.SortedHash.prototype.map = function (f) {
  var result = this.clone(),
      that = this;
  result.each(function(index, item) {
    result.data[that.key(index)] = f.call(result, item);
  });
  return result;
};

// Select items that match some conditions expressed by a matcher function
// Parameters:
//   * [Function] matcher function
uv.SortedHash.prototype.select = function (f) {
  var result = new uv.SortedHash(),
      that = this;
  
  this.eachKey(function(key, value) {
    if (f.call(that, key, value)) {
      result.set(key, value);
    }
  });
  return result;
};

// Performs a sort on the SortedHash
// Parameters:
//   * comparator [Function] A comparator function
// Returns:
//   * The now re-sorted SortedHash (for chaining)
uv.SortedHash.prototype.sort = function (comparator) {
  var result = this.clone();
      sortedKeys = result.toArray().sort(comparator);

  // update keyOrder
  result.keyOrder = $.map(sortedKeys, function(k) {
    return k.key;
  });
  
  return result;
};


// Performs an intersection with the given SortedHash
// Parameters:
//   * sortedHash [SortedHash]
uv.SortedHash.prototype.intersect = function(sortedHash) {
  var that = this,
  result = new uv.SortedHash();
  
  this.eachKey(function(key, value) {
    sortedHash.eachKey(function(key2, value2) {
      if (key === key2) {
        result.set(key, value);
      }
    });
  });
  return result;
};

// Performs an union with the given SortedHash
// Parameters:
//   * sortedHash [SortedHash]
uv.SortedHash.prototype.union = function(sortedHash) {
  var that = this,
  result = new uv.SortedHash();
  
  this.eachKey(function(key, value) {
    if (!result.get(key))
      result.set(key, value);
  });
  sortedHash.eachKey(function(key, value) {
    if (!result.get(key))
      result.set(key, value);
  });
  return result;
};
// Aggregators
//-----------------------------------------------------------------------------

uv.Aggregators = {};

uv.Aggregators.SUM = function (values) {
  var result = 0;
  
  values.each(function(index, value) {
    result += value;
  });

  return result;
};

uv.Aggregators.MIN = function (values) {
  var result = Infinity;
  values.each(function(index, value) {
    if (value < result) {
      result = value;
    }
  });
  return result;
};

uv.Aggregators.MAX = function (values) {
  var result = -Infinity;
  values.each(function(index, value) {
    if (value > result) {
      result = value;
    }
  });
  return result;
};

uv.Aggregators.AVG = function (values) {
  return uv.Aggregators.SUM(values) / values.length;
};

uv.Aggregators.COUNT = function (values) {
  return values.length;
};


// Comparators
//-----------------------------------------------------------------------------

uv.Comparators = {};

uv.Comparators.ASC = function(item1, item2) {
  return item1.value === item2.value ? 0 : (item1.value < item2.value ? -1 : 1);
};

uv.Comparators.DESC = function(item1, item2) {
  return item1.value === item2.value ? 0 : (item1.value > item2.value ? -1 : 1);
};


// Node API for JavaScript
// ========================================================================
// 
// JavaScript Graph implementation that hides graph complexity from
// the interface. It introduces properties, which group types of edges
// together. Therefore multi-partit graphs are possible without any hassle.
// Every Node simply contains properties which conform to outgoing edges.
// It makes heavy use of hashing through JavaScript object properties to
// allow random access whenever possible. If I've got it right, it should 
// perform sufficiently fast in future, allowing speedy graph traversals.
// 
// Author: Michael Aufreiter
// 
// Dependencies:
//   * jQuery 1.4.2

// Node
// ------------------------------------------------------------------------
// 
// Node constructor
// 
// Parameters:
//   * options [Object]
//     - key [String] A readable unique Node identifier
//     - value [Object] The value to be stored for nodes, useful for simple types
// 
// Returns:
//   => [Node] the constructed Node
uv.Node = function (options) {
  this.id = uv.Node.generateId();
  if (options) {
    this.val = options.value; // used for leave nodes (simple types)
  }
  this._properties = {};
};

// Node identity
//
// Returns:
//   => [String, Number] The Node's identity which is simply the node's id
uv.Node.prototype.identity = function() {
  return this.id;
};

uv.Node.nodeCount = 0;

// Generates a unique id for each node
//
// Returns:
//   => [Number] A unique nodeId
uv.Node.generateId = function () {
  return uv.Node.nodeCount += 1;
};


uv.Node.prototype.replace = function(property, sortedHash) {
  this._properties[property] = sortedHash;
};

// Set a Node's property
// 
// Parameters:
//   - property <String> A readable property key
//   - key <String> The value key
//   - value <Node | Object> Either a Node or an arbitrary Object
//
// Returns:
//   => [Node] The Node for property chaining
uv.Node.prototype.set = function (property, key, value) {
  if (!this._properties[property]) {
    this._properties[property] = new uv.SortedHash();
  }
  this._properties[property].set(key, value instanceof uv.Node ? value : new uv.Node({value: value}));
  return this;
};

// Get node for given property at given key
// 
// Returns:
//   => [Node] The target Node
uv.Node.prototype.get = function (property, key) {
  if (key && this._properties[property]!== undefined) {
    return this._properties[property].get(key);
  }
};


// Get all connected nodes at given property
// Returns:
//   => [SortedHash] A SortedHash of Nodes
uv.Node.prototype.all = function(property) {
  return this._properties[property];
};


// Get first connected node at given property
// 
// Useful if you want to mimic the behavior of unique properties.
// That is, if you know that there's always just one associated node
// at a given property.
// 
// Returns:
//   => [SortedHash] A SortedHash of Nodes
uv.Node.prototype.first = function(property) {
  var p = this._properties[property];
  return p ? p.first() : null;  
};

// Value of first connected target node at given property
// 
// Returns:
//   => [Object] The Node's value property
uv.Node.prototype.value = function(property) {
  return this.values(property).first();
};

// Values of associated target nodes for non-unique properties
// 
// Returns:
//   => [SortedHash] List of Node values
uv.Node.prototype.values = function(property) {
  // TODO: check why this fails sometimes
  if (!this.all(property)) return new uv.SortedHash();
  
  return this.all(property).map(function(n) {
    return n.val;
  });
};

uv.Node.prototype.toString = function() {
  var str = "Node#"+this.id+" {\n",
      that = this;
      
  $.each(this._properties, function(key, node) {
    str += "  "+key+": "+that.values(key).values()+"\n";
  });
  
  str += "}";
  return str;
};


//-----------------------------------------------------------------------------
// Value
//-----------------------------------------------------------------------------

// A value after construction is not connected to other nodes
// Property#registerValue initializes the connections appropriately
uv.Value = function (value) {
  var that = this;
  // super call / node constructor
  uv.Node.call(this, {value: value});
};

uv.Value.prototype = Object.extend(uv.Node);

// Returns a copy without items
// used by uv.Collection#filter
uv.Value.prototype.clone = function () {
  var copy = new uv.Value(this.val);
  copy.replace('items', new uv.SortedHash());
  return copy;
};

//-----------------------------------------------------------------------------
// Item
//-----------------------------------------------------------------------------

uv.Item = function (collection, key, attributes, nested) {
  var that = this;
  
  // super call / node constructor
  uv.Node.call(this);
  this.key = key;
    
  // register item properties
  $.each(attributes, function(key, values) {
    var property = collection.get('properties', key);
    var valueKey;
    
    if (!$.isArray(values)) {
      values = [values];
    }
    
    $.each(values, function(index, v) {
      var value;
      if (property.type === 'collection') {
        value = new uv.Collection({properties: property.collection_properties, items: v});
        valueKey = 'collection'; // serves as the collection values key name
      } else {
        value = property.registerValue(v);
        valueKey = v;
        // connect value with its items
        value.set('items', that.key, that);
      }
      // connect item with its values
      that.set(key, valueKey, value);
    });
  });
  
  this.collection = collection;
  collection.set('items', key, this);
};

uv.Item.prototype = Object.extend(uv.Node);

// return the type of a specific property
uv.Item.prototype.type = function (property) {
  var p = this.collection.get("properties", property);
  return p.type;
};

// tries to find a name property, that identifies the item
uv.Item.prototype.identify = function() {
  var identifier = this.value('name') || this.value('source');
  return identifier || this.key;
};



//-----------------------------------------------------------------------------
// Property
//-----------------------------------------------------------------------------

uv.Property = function (collection, key, options) {
  // super call / node constructor
  uv.Node.call(this);
  
  // construct properties
  this.key = key;
  this.type = options.type;
  this.name = options.name;
  this.descr = options.descr;
  
  this.unique = options.unique;
  this.categories = options.categories;
  this.collection = collection;
  
  // remember properties for nested collection
  if (options.properties) {
    this.collection_properties = options.properties;
  }
};

uv.Property.prototype = Object.extend(uv.Node);

// Returns a copy without values
// used by Collection#filter
uv.Property.prototype.clone = function (collection) {
  var copy = new uv.Property(collection, this.key, {
    type: this.type,
    name: this.name
  });
  copy.replace('values', new uv.SortedHash());
  return copy;
};

uv.Property.prototype.toString = function() {
  return this.name;
};

// aggregates the property's values
uv.Property.prototype.aggregate = function (f) {
  return f(this.values("values"));
};

// Private Methods
//-----------------------------------------------------------------------------

uv.Property.prototype.registerValue = function(rawValue) {
  var value = this.get('values', rawValue);
  if (value === undefined) {
    value = new uv.Value(rawValue);
    this.set('values', rawValue, value);
  }
  return value;
};



//-----------------------------------------------------------------------------
// Collection
//-----------------------------------------------------------------------------

uv.Collection = function (options) {
  uv.Node.call(this);
  var that = this;
  
  if (options) {
    $.each(options.properties, function(key, options) {
      var p = new uv.Property(that, key, options);
      that.set('properties', key, p);
    });
    
    // initialize items property, even if there are no items in the collection
    this.replace('items', new uv.SortedHash());
    
    $.each(options.items, function(key, i) {
      var item = new uv.Item(that, key, i, true);
    });
  }
};

// The is where transformers have to register
uv.Collection.transformers = {};

uv.Collection.prototype = Object.extend(uv.Node);

uv.Collection.prototype.filter = function(criteria) {
  var c2 = new uv.Collection();
  c2.replace('items', criteria.items(this));
  
  // TODO: Find a better way
  // Sadly, everything needs to be copied in order 
  // to reflect correct connections between nodes
  this.all('properties').eachKey(function(key, p) {
    // get the right values
    var pcopy = p.clone(c2);
    // register values
    p.all('values').eachKey(function(key, v) {
      var sharedItems = c2.all('items').intersect(v.all('items'));
      if (sharedItems.length > 0) {
        var vcopy = v.clone();
        vcopy.replace('items', sharedItems);
        pcopy.set('values', key, vcopy);
      }
    });
    c2.set('properties', key, pcopy);
  });
  return c2;
};

// Performs an operation and returns a new transformed collection
// The original collection remains untouched
uv.Collection.prototype.transform = function(transformer, params) {
  return uv.Collection.transformers[transformer].call(this, this, params);
};

//-----------------------------------------------------------------------------
// Criterion
//-----------------------------------------------------------------------------

uv.Criterion = function (operator, property, value) {
  this.operator = operator;
  this.property = property;
  this.value = value;
  this.children = [];
};

uv.Criterion.operators = {};

// Logical Connectors
//-----------------------------------------------------------------------------

uv.Criterion.operators.AND = function(collection, criteria) {
  if (criteria.length === 0) return new uv.SortedHash();
  var result = criteria[0].items(collection);
  for(var i=1; i < criteria.length; i++) {
    result = result.intersect(criteria[i].items(collection));
  }
  return result;
};

uv.Criterion.operators.OR = function(collection, criteria) {
  var result = new uv.SortedHash();
  for(var i=0; i < criteria.length; i++) {
    result = result.union(criteria[i].items(collection));
  }
  return result;
};

// Logical Operators
//-----------------------------------------------------------------------------

// used for faceted browsing
uv.Criterion.operators.CONTAINS = function(collection, property_key, value) {
  var property = collection.get('properties', property_key),
      v = property.get('values', value);
  return v.all('items');
};

uv.Criterion.operators.GT = function(collection, property_key, value) {
  var property = collection.get('properties', property_key),
      values = property.all('values'),
      matchedItems = new uv.SortedHash();
  values = values.select(function(key, v) {
    return v.val >= value;
  });
  values.each(function(i, v) {
    matchedItems = matchedItems.union(v.all('items'));
  });
  return matchedItems;
};

uv.Criterion.prototype.add = function(criterion) {
  this.children.push(criterion);
  return this;
};

uv.Criterion.prototype.items = function(collection) {
  // execute operator
  if (this.operator === "AND") {
    return uv.Criterion.operators.AND(collection, this.children);
  } else if (this.operator === "OR") {
    return uv.Criterion.operators.OR(collection, this.children);
  } else {
    // leaf nodes
    return uv.Criterion.operators[this.operator](collection, this.property, this.value);
  }
};


uv.Collection.transformers.group = function(c, params) {
  var c2 = new uv.Collection(),
      property = c.get('properties', params.property),
      values = property.all('values');
  
  // compute properties
  c.all('properties').eachKey(function(key, p) {
    if (p.key === property.key || p.type === 'number') {
      var p2 = new uv.Property(c2, key, {type: p.type, name: p.name, unique: p.unique});
      c2.set('properties', key, p2);
    }
  });
  
  function aggregate(items, property, aggregator) {
    var values = new uv.SortedHash();
    items.eachKey(function(key, item) {
      var val = item.value(property);
      values.set(val, val);
    });
    return Aggregators[aggregator](values);
  };
  
  values.each(function(index, value) {
    var aggregatedItem = {};
    var items = value.all('items');
    
    // aggregation
    c2.all('properties').eachKey(function(key, p) {
      if (key === params.property) {
        aggregatedItem[key] = value.val;
      } else {
        aggregatedItem[key] = aggregate(items, key, params.aggregator);
      }
    });
    
    var i = new uv.Item(c2, value.val, aggregatedItem);
  });
    
  return c2;
};

// Transformer specification
uv.Collection.transformers.group.label = "Group By";
uv.Collection.transformers.group.params = {
  property: {
    name: "Property",
    type: "property"
  },
  aggregator: {
    name: "Aggregator Function",
    type: "aggregator"
  }
};


uv.Collection.transformers.coOccurrences = function(c, params) {
  if (!params.property || !params.knn) return c;
  
  var targetItems = {},
      property = c.get('properties', params.property),
      values = property.all('values');
  
  function coOccurrences(v1, v2) {
    var items1 = v1.all('items'),
        items2 = v2.all('items');
    return items1.intersect(items2).length;
  };
  
  function similarity(v1, v2) {
    return 0.5* (coOccurrences(v1, v2) / coOccurrences(v1, v1)
          + coOccurrences(v2, v1) / coOccurrences(v2, v2));
  };
  
  // get property values
  values.each(function(index, value) {
    targetItems[value.val] = {
      source: value.val,
      "similar_items": {}
    };

    var similarItems = [];
    
    values.each(function (index, otherValue) {
      var sim = similarity(value, otherValue);
      if (sim>0 && value.val !== otherValue.val) {
        similarItems.push({
          "name": otherValue.val,
          "number_of_cooccurrences": coOccurrences(value, otherValue),
          "score": sim
        });
      }
    });
        
    // sort by score
    similarItems.sort(function(item1, item2) {
      var value1 = item1.score,
          value2 = item2.score;
      return value1 === value2 ? 0 : (value1 > value2 ? -1 : 1);
    });
    
    similarItems = similarItems.slice(0, params.knn);
    
    var similarItemsHash = {};
    $.each(similarItems, function(index, item) {
      similarItemsHash[item.name] = item;
    });

    targetItems[value.val].source = value.val;
    targetItems[value.val].similar_items = similarItemsHash;
  });

  // construct a new collection that models coocurrences
  var cspec = {
    properties: {
      source: {
        name: "Source",
        type: "string",
        unique: true
      },
      similar_items: {
        name: "Similar Items",
        type: "collection",
        unique: true,
        properties: {
          "name": {
            name: 'Name',
            type: 'string',
            unique: true
          },
          "number_of_cooccurrences": {
            name: 'Number of Co-occurrences',
            type: 'number',
            unique: true
          },
          "score": {
            name: 'Similarity Score',
            type: 'number',
            unique: true
          }
        }
      }
    },
    items: targetItems
  };
  return new uv.Collection(cspec);
};

// Operation specification
uv.Collection.transformers.coOccurrences.label = "Similarity (COOC)";
uv.Collection.transformers.coOccurrences.params = {
  property: {
    name: "Property",
    type: "property"
  },
  knn: {
    name: "K-nearest Neighbor",
    type: "number"
  }
};
uv.Collection.transformers.coOccurrencesBaccigalupo = function(c, params) {

  // check for valid params
  if (!params.property || !params.knn) return c;
  
  var targetItems = {},
      property = c.get('properties', params.property),
      values = property.all('values');
  
  function checkDistance(playlist, v1, v2, d) {
    for (var i = 0; i<playlist.values(params.property).length-d; i++) {
      
      if (playlist.values(params.property).at(i)===v1.val && playlist.values(params.property).at(i+d+1)===v2.val) {
        return true;
      }
    }
    return false;
  };
  
  function coOccurencesAtDistance(v1, v2, d) {
    var items1 = v1.all('items'),
        items2 = v2.all('items'),
        playlists = items1.intersect(items2);
        
    return playlists.select(function(key, p) {
      return checkDistance(p, v1, v2, d);
    }).length;
  };
  
  function similarity(v1, v2) {
    return 1*coOccurencesAtDistance(v1, v2, 0) +
           0.8* coOccurencesAtDistance(v1, v2, 1) +
           0.64* coOccurencesAtDistance(v1, v2, 2);
  };
  
  // get property values
  values.each(function(index, value) {
    targetItems[value.val] = {
      source: value.val,
      "similar_items": {}
    };

    var similarItems = [];
    
    values.each(function (index, otherValue) {
      var sim = similarity(value, otherValue);
      
      if (sim>0 && value.val !== otherValue.val) {
        similarItems.push({
          "name": otherValue.val,
          "number_of_cooccurrences": 0,
          "score": sim
        });
      }
    });
    
    // sort by score
    similarItems.sort(function(item1, item2) {
      var value1 = item1.score,
          value2 = item2.score;
      return value1 === value2 ? 0 : (value1 > value2 ? -1 : 1);
    });
    
    similarItems = similarItems.slice(0, params.knn);
    
    var similarItemsHash = {};
    $.each(similarItems, function(index, item) {
      similarItemsHash[item.name] = item;
    });
    
    targetItems[value.val].source = value.val;
    targetItems[value.val].similar_items = similarItemsHash;
    
  });
  
  // construct a new collection that models coocurrences
  var cspec = {
    properties: {
      source: {
        name: "Source",
        type: "string",
        unique: true
      },
      similar_items: {
        name: "Similar Items",
        type: "collection",
        unique: true,
        properties: {
          "name": {
            name: 'Name',
            type: 'string',
            unique: true
          },
          "number_of_cooccurrences": {
            name: 'Number of Co-occurrences',
            type: 'number',
            unique: true
          },
          "score": {
            name: 'Similarity Score',
            type: 'number',
            unique: true
          }
        }
      }
    },
    items: targetItems
  };
  
  return new uv.Collection(cspec);
};

// Transformer specification
uv.Collection.transformers.coOccurrencesBaccigalupo.label = "Co-Occurrences Baccigalupo";
uv.Collection.transformers.coOccurrencesBaccigalupo.params = {
  property: {
    name: "Property",
    type: "property"
  },
  knn: {
    name: "K-nearest Neighbor",
    type: "number"
  }
};
////////////////////////////////////////////////////////////////////////////
// Vector
// Taken from Processing.js
////////////////////////////////////////////////////////////////////////////
uv.Vector = function(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};

uv.Vector.angleBetween = function(v1, v2) {
  return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
};

// Common vector operations for Vector
uv.Vector.prototype = {
  set: function(v, y, z) {
    if (arguments.length === 1) {
      this.set(v.x || v[0], v.y || v[1], v.z || v[2]);
    } else {
      this.x = v;
      this.y = y;
      this.z = z;
    }
  },
  get: function() {
    return new uv.Vector(this.x, this.y, this.z);
  },
  mag: function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },
  add: function(v, y, z) {
    if (arguments.length === 3) {
      this.x += v;
      this.y += y;
      this.z += z;
    } else if (arguments.length === 1) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
    }
  },
  sub: function(v, y, z) {
    if (arguments.length === 3) {
      this.x -= v;
      this.y -= y;
      this.z -= z;
    } else if (arguments.length === 1) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
    }
  },
  mult: function(v) {
    if (typeof v === 'number') {
      this.x *= v;
      this.y *= v;
      this.z *= v;
    } else if (typeof v === 'object') {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
    }
  },
  div: function(v) {
    if (typeof v === 'number') {
      this.x /= v;
      this.y /= v;
      this.z /= v;
    } else if (typeof v === 'object') {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;
    }
  },
  dist: function(v) {
    var dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  dot: function(v, y, z) {
    var num;
    if (arguments.length === 3) {
      num = this.x * v + this.y * y + this.z * z;
    } else if (arguments.length === 1) {
      num = this.x * v.x + this.y * v.y + this.z * v.z;
    }
    return num;
  },
  cross: function(v) {
    var
    crossX = this.y * v.z - v.y * this.z,
      crossY = this.z * v.x - v.z * this.x,
      crossZ = this.x * v.y - v.x * this.y;
    return new uv.Vector(crossX, crossY, crossZ);
  },
  normalize: function() {
    var m = this.mag();
    if (m > 0) {
      this.div(m);
    }
  },
  limit: function(high) {
    if (this.mag() > high) {
      this.normalize();
      this.mult(high);
    }
  },
  heading2D: function() {
    var angle = Math.atan2(-this.y, this.x);
    return -angle;
  },
  toString: function() {
    return "[" + this.x + ", " + this.y + ", " + this.z + "]";
  },
  array: function() {
    return [this.x, this.y, this.z];
  }
};

// Matrix2D (taken from Processing.js)
// =============================================================================
// 
// TODO: look for a more functional-style matrix implementation
// http://files.geomajas.org/doc/jsdoc/1.3.1/overview-summary-Matrix2D.js.html

uv.printMatrixHelper = function printMatrixHelper(elements) {
  var big = 0;
  for (var i = 0; i < elements.length; i++) {

    if (i !== 0) {
      big = Math.max(big, Math.abs(elements[i]));
    } else {
      big = Math.abs(elements[i]);
    }
  }
  var digits = (big + " ").indexOf(".");
  if (digits === 0) {
    digits = 1;
  } else if (digits === -1) {
    digits = (big + " ").length;
  }
  return digits;
};

uv.Matrix2D = function() {
  if (arguments.length === 0) {
    this.reset();
  } else if (arguments.length === 1 && arguments[0] instanceof uv.Matrix2D) {
    this.set(arguments[0].array());
  } else if (arguments.length === 6) {
    this.set(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
  }
};

uv.Matrix2D.prototype = {
  set: function() {
    if (arguments.length === 6) {
      var a = arguments;
      this.set([a[0], a[1], a[2],
                a[3], a[4], a[5]]);
    } else if (arguments.length === 1 && arguments[0] instanceof uv.Matrix2D) {
      this.elements = arguments[0].array();
    } else if (arguments.length === 1 && arguments[0] instanceof Array) {
      this.elements = arguments[0].slice();
    }
  },
  get: function() {
    var outgoing = new pv.Matrix2D();
    outgoing.set(this.elements);
    return outgoing;
  },
  reset: function() {
    this.set([1, 0, 0, 0, 1, 0]);
  },
  // Returns a copy of the element values.
  array: function array() {
    return this.elements.slice();
  },
  translate: function(tx, ty) {
    this.elements[2] = tx * this.elements[0] + ty * this.elements[1] + this.elements[2];
    this.elements[5] = tx * this.elements[3] + ty * this.elements[4] + this.elements[5];
  },
  // Does nothing in Processing.
  transpose: function() {
  },
  mult: function(source, target) {
    var x, y;
    if (source instanceof uv.Vector) {
      x = source.x;
      y = source.y;
      if (!target) {
        target = new uv.Vector();
      }
    } else if (source instanceof Array) {
      x = source[0];
      y = source[1];
      if (!target) {
        target = [];
      }
    }
    if (target instanceof Array) {
      target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2];
      target[1] = this.elements[3] * x + this.elements[4] * y + this.elements[5];
    } else if (target instanceof uv.Vector) {
      target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2];
      target.y = this.elements[3] * x + this.elements[4] * y + this.elements[5];
      target.z = 0;
    }
    return target;
  },
  multX: function(x, y) {
    return x * this.elements[0] + y * this.elements[1] + this.elements[2];
  },
  multY: function(x, y) {
    return x * this.elements[3] + y * this.elements[4] + this.elements[5];
  },
  skewX: function(angle) {
    this.apply(1, 0, 1, angle, 0, 0);
  },
  skewY: function(angle) {
    this.apply(1, 0, 1, 0, angle, 0);
  },
  determinant: function() {
    return this.elements[0] * this.elements[4] - this.elements[1] * this.elements[3];
  },
  // non-destrucive version
  inverse: function() {
    var res = new uv.Matrix2D(this);
    return res.invert() ? res : null;
  },
  invert: function() {
    var d = this.determinant();
    
    if ( Math.abs( d ) > uv.MIN_FLOAT ) {
      var old00 = this.elements[0];
      var old01 = this.elements[1];
      var old02 = this.elements[2];
      var old10 = this.elements[3];
      var old11 = this.elements[4];
      var old12 = this.elements[5];
      this.elements[0] =  old11 / d;
      this.elements[3] = -old10 / d;
      this.elements[1] = -old01 / d;
      this.elements[4] =  old00 / d;
      this.elements[2] = (old01 * old12 - old11 * old02) / d;
      this.elements[5] = (old10 * old02 - old00 * old12) / d;
      return true;
    }
    return false;
  },
  scale: function(sx, sy) {
    if (sx && !sy) {
      sy = sx;
    }
    if (sx && sy) {
      this.elements[0] *= sx;
      this.elements[1] *= sy;
      this.elements[3] *= sx;
      this.elements[4] *= sy;
    }
  },
  // matrix mult of the current matrix with the given matrix, stored in the current matrix
  apply: function() {
    if (arguments.length === 1 && arguments[0] instanceof uv.Matrix2D) {
      this.apply(arguments[0].array());
    } else if (arguments.length === 6) {
      var a = arguments;
      this.apply([a[0], a[1], a[2],
                  a[3], a[4], a[5]]);
    } else if (arguments.length === 1 && arguments[0] instanceof Array) {
      var source = arguments[0];
      var result = [0, 0, this.elements[2],
                    0, 0, this.elements[5]];
      var e = 0;
      for (var row = 0; row < 2; row++) {
        for (var col = 0; col < 3; col++, e++) {
          result[e] += this.elements[row * 3 + 0] * source[col + 0] + this.elements[row * 3 + 1] * source[col + 3];
        }
      }
      this.elements = result.slice();
    }
  },
  preApply: function() {
    if (arguments.length === 1 && arguments[0] instanceof uv.Matrix2D) {
      this.preApply(arguments[0].array());
    } else if (arguments.length === 6) {
      var a = arguments;
      this.preApply([a[0], a[1], a[2],
                     a[3], a[4], a[5]]);
    } else if (arguments.length === 1 && arguments[0] instanceof Array) {
      var source = arguments[0];
      var result = [0, 0, source[2],
                    0, 0, source[5]];
      result[2]= source[2] + this.elements[2] * source[0] + this.elements[5] * source[1];
      result[5]= source[5] + this.elements[2] * source[3] + this.elements[5] * source[4];
      result[0] = this.elements[0] * source[0] + this.elements[3] * source[1];
      result[3] = this.elements[0] * source[3] + this.elements[3] * source[4];
      result[1] = this.elements[1] * source[0] + this.elements[4] * source[1];
      result[4] = this.elements[1] * source[3] + this.elements[4] * source[4];
      this.elements = result.slice();
    }
  },
  rotate: function(angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var temp1 = this.elements[0];
    var temp2 = this.elements[1];
    this.elements[0] =  c * temp1 + s * temp2;
    this.elements[1] = -s * temp1 + c * temp2;
    temp1 = this.elements[3];
    temp2 = this.elements[4];
    this.elements[3] =  c * temp1 + s * temp2;
    this.elements[4] = -s * temp1 + c * temp2;
  },
  rotateZ: function(angle) {
    this.rotate(angle);
  },
  toString: function() {
    var digits = uv.printMatrixHelper(this.elements);
    var output = "";
    
    output += "[" +this.elements[0] + " " + this.elements[1] + " " + this.elements[2] + " ]\n";
    output += "[" +this.elements[3] + " " + this.elements[4] + " " + this.elements[5] + " ]\n\n";
    
    return output;
  }
};
// Actor - Graphical object to be attached to the scene graph
// =============================================================================

uv.Actor = function(properties) {
  uv.Node.call(this);
  this.childCount = 0;
  
  // Default actor properties
  this.properties = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    fillStyle: '#000',
    strokeStyle: '#000',
    visible: true
  };
  
  _.extend(this.properties, properties);
  
  // Under mouse cursor
  this.active = false;
  
  // The modification matrix
  // Works like a regular transformation matrix, with the difference
  // that it doesn't describe the whole transformation to be applied.
  // The render() method first applies the current properties 
  // (x, y, scaleX, scaleY) followed by modification matrix.
  this.matrix = new uv.Matrix2D();
};

uv.Actor.prototype = Object.extend(uv.Node);

// evaluates a property (in case of a function
// the result of the function is returned)

uv.Actor.prototype.property = function(property, value) {
  if (value) {
    this.properties[property] = value;
    return value;
  } else {
    if (this.properties[property] instanceof Function)
      return this.properties[property].call(this);
    else
      return this.properties[property];    
  }
};

// Property get-setter aliases
uv.Actor.prototype.prop = uv.Actor.prototype.property;
uv.Actor.prototype.p = uv.Actor.prototype.property;

// Recursively sets the scene reference to itself and all childs.
// Registers an interactive node on the scene object if the user explicitly
// declares the node as interactive, where interactivity conforms to activated
// enabled interaction.

uv.Actor.prototype.setScene = function(scene) {
  this.scene = scene;
  if (this.properties.interactive) {
    scene.interactiveNodes.push(this);
  }
  
  if (this.all('children')) {
    this.all('children').each(function(index, child) {
      child.setScene(scene);
    });
  }
};


// Adds a new actor to the scene.
// The object is attached as a child object

uv.Actor.prototype.add = function(child) {
  this.set('children', this.childCount+=1, child);
  child.parent = this;
  return child;
};


// Matrix transformations
// -----------------------------------------------------------------------------
// 
// You have full control about the current transformation matrix. Be aware that
// Actor properties like x, y, scaleX, scaleY, rotation are applied in the first
// place. After that this modification matrix is applied. It's good practice to
// not specify any properties when working with the modification matrix. If you
// do that you can treat the modification matrix as the actual transformation
// matrix.
// 
// Destructive operations
// .............................................................................
//
// Those methods all reset the modification matrix for now. So you cant combine
// setScale() and setRotation()

// Scales and rotates around a given point
// Rotation does not work yet
// TODO: implement rotation according to [R] = [T]-1 * [R0] * [T]

uv.Actor.prototype.setScaleAndRotateAroundPos = function(scaleX, scaleY, rot, rx, ry) {
  this.matrix.reset();
  this.matrix.translate(rx, ry);
  this.matrix.scale(scaleX, scaleY);
  this.matrix.translate(-rx, -ry);
};

uv.Actor.prototype.setTranslation = function(x, y) {
  this.matrix.reset();
  this.matrix.translate(x, y);
};

uv.Actor.prototype.setScale = function(scaleX, scaleY) {
  this.matrix.reset();
  this.matrix.scale(scaleX, scaleY);
};

uv.Actor.prototype.setRotation = function(rotation) {
  this.matrix.reset();
  this.matrix.rotate(rotation);
};

// Non destructive operations
// .............................................................................
// 
// Those methods can be chained together. The modification matrix is updated
// according to the specified operation.

uv.Actor.prototype.translate = function(x, y) {
  this.matrix.translate(x, y);
  return this;
};

uv.Actor.prototype.scale = function(scaleX, scaleY) {
  this.matrix.scale(scaleX, scaleY);
  return this;
};

uv.Actor.prototype.rotate = function(rotation, rx, ry) {
  this.matrix.rotate(rotation);
  return this;
};


// Drawing, masking and rendering
// -----------------------------------------------------------------------------

uv.Actor.prototype.update = function() {};
uv.Actor.prototype.draw = function(ctx) {};

uv.Actor.prototype.checkActive = function(ctx, mouseX, mouseY) {
  if (this.drawMask && ctx.isPointInPath) {
    this.drawMask(ctx);
    if (ctx.isPointInPath(mouseX, mouseY))
      this.active = true;
    else
      this.active = false;
  }
  return false;
};

// compile transformation matrix
uv.Actor.prototype.preRender = function() {
  // start with the parent matrix
  
  if (this.parent) {
    this.tmatrix = new uv.Matrix2D(this.parent.tmatrix);
  } else {
    this.tmatrix = new uv.Matrix2D();
  }
  
  this.update();
  
  this.tmatrix.translate(this.p('x'), this.p('y'));
  this.tmatrix.rotate(this.p('rotation'));
  this.tmatrix.scale(this.p('scaleX'), this.p('scaleY'));
  
  // apply the modification matrix to the dynamically initialized one
  this.tmatrix.apply(this.matrix);
  
  if (this.all('children')) {
    this.all('children').each(function(i, child) {
      child.preRender();
    });
  }
};


uv.Actor.prototype.render = function(ctx, view) {
  var that = this;
  
  if (!this.p('visible')) return;
  
  // apply the view transformation
  var transform = new uv.Matrix2D(view);
  
  // apply the object's transformation matrix
  transform.apply(this.tmatrix);
  
  ctx.setTransform(transform.elements[0], transform.elements[1], transform.elements[3], 
                transform.elements[4], transform.elements[2], transform.elements[5]);
  
  if (this.p('interactive')) {
    this.checkActive(ctx, this.scene.displayX, this.scene.displayY);
  }
  
  this.draw(ctx);
  
  // TODO: don't use a call stack, instead allow arbitrary tree traversals
  // as the drawing order.
  if (this.all('children')) {
    this.all('children').each(function(i, child) {
      child.render(ctx, view);
    });    
  }
};
uv.ZoomBehavior = function(display) {
  function zoom(zoom, rx, ry) {
    display.matrix.translate(rx, ry);
    display.matrix.scale(zoom, zoom);
    display.matrix.translate(-rx, -ry);
  }
  
  display.$canvas.bind('mousewheel', function(event, delta) {
    zoom(1+0.02 * delta, display.scene.mouseX, display.scene.mouseY);
  });
};


uv.PanBehavior = function(display) {
  var paning = false;
  
  var mouseX, mouseY;
  var startX, startY;
  var offsetX = 0;
  var offsetY = 0;
  var prevOffsetX = 0;
  var prevOffsetY = 0;
  
  display.$canvas.bind('mousedown', function(event) {
    paning = true;
    startX = display.mouseX;
    startY = display.mouseY;
    prevOffsetX = 0;
    prevOffsetY = 0;
  });
  
  display.$canvas.bind('mouseup', function(event) {
    paning = false;
  });
  
  display.$canvas.bind('mousemove', function(event) {
    if (paning) {
      offsetX = display.mouseX-startX;
      offsetY = display.mouseY -startY;
      
      deltaX = offsetX - prevOffsetX;
      deltaY = offsetY - prevOffsetY;
      
      prevOffsetX = offsetX;
      prevOffsetY = offsetY;
      
      display.matrix.translate(deltaX,deltaY);
    }
  });
};


uv.Display = function(scene, opts) {
  this.scene = scene;

  this.$element = opts.container;
  this.$canvas = $('<canvas width="'+opts.width+'" ' +
                    'height="'+opts.height+'"></canvas>');
  
  this.width = opts.width;
  this.height = opts.height;
  
  this.$element.append(this.$canvas);
  this.ctx = this.$canvas[0].getContext("2d");
  
  this.matrix = new uv.Matrix2D();
  
  // attach behaviors
  if (opts.zooming) {
    this.zoombehavior = new uv.ZoomBehavior(this);
  }
  
  if (opts.paning) {
    this.panbehavior = new uv.PanBehavior(this);
  }
};

// udates the display (on every frame)
uv.Display.prototype.refresh = function() {
  var that = this;
  
  function mouseMove(e) {
    var mouseX, mouseY;
  
    if (e.offsetX) {
      mouseX = e.offsetX;
      mouseY = e.offsetY;
    } else if (e.layerX) {
      mouseX = e.layerX;
      mouseY = e.layerY;
    }
        
    var mat = new uv.Matrix2D(that.matrix);
    mat.invert();
    
    var worldPos = mat.mult(new uv.Vector(mouseX, mouseY));
    var worldX = parseInt(worldPos.x);
    var worldY = parseInt(worldPos.y);

    that.mouseX = mouseX;
    that.mouseY = mouseY;
    
    that.scene.mouseX = worldX;
    that.scene.mouseY = worldY;
    
    that.scene.displayX = mouseX;
    that.scene.displayY = mouseY;
  }
  
  this.$canvas.bind('mousemove', mouseMove);
  
  // draw the scene
  this.ctx.clearRect(0,0, this.width,this.height);
  this.ctx.fillStyle = this.scene.prop('fillStyle');
  this.ctx.fillRect(0, 0, this.width, this.height);
  this.ctx.save();
  
  if (this.scene.all('children')) {
    this.scene.all('children').each(function(i, child) {
      child.render(that.ctx, that.matrix);
    });
  }
  
  this.ctx.restore();
};
// Commands
// =============================================================================
// 
// Commands are used to modify properties on the scene. They can be executed
// one or many times, and they can be unexecuted to recover the original state

uv.cmds = {};

uv.cmds.RequestFramerate = function(scene, opts) {
  this.scene = scene;
  this.requests = 0;
  this.framerate = opts.framerate;
  this.originalFramerate = this.scene.framerate;
};

uv.cmds.RequestFramerate.className = 'RequestFramerate';

uv.cmds.RequestFramerate.prototype.execute = function() {
  this.requests += 1;
  this.scene.framerate = this.framerate;
};

uv.cmds.RequestFramerate.prototype.unexecute = function() {
  this.requests -= 1;
  if (this.requests <= 0) {
    this.scene.framerate = this.originalFramerate;
  }
};
// Scene
// =============================================================================

uv.Scene = function(properties) {
  // super call
  uv.Actor.call(this);
  
  _.extend(this.properties, {
    width: 0,
    height: 0,
    fillStyle: '#fff',
    element: '#canvas',
    framerate: 10
  }, properties);
  
  this.mouseX = this.displayX = -1;
  this.mouseY = this.displayY = -1;
  
  // keeps track of nodes that capture mouse events
  this.interactiveNodes = [];
  
  // the scene property references the scene an actor belongs to
  this.scene = this;
  
  // commands hook in here
  this.commands = {};
  
  // attached displays
  this.displays = [];
  
  this.fps = 0;
  this.framerate = this.p('framerate');
};

uv.Scene.prototype = Object.extend(uv.Actor);

uv.Scene.prototype.add = function(child) {
  child.setScene(this);
  
  uv.Actor.prototype.add.call(this, child);
  return child;
};

uv.Scene.prototype.add = function(child) {
  this.set('children', this.childCount+=1, child);
  
  // updates all childs that do not have a scene reference
  child.setScene(this);
  return child;
};

uv.Scene.prototype.start = function(options) {
  var that = this,
      opts = { framerate: 50, idleFramerate: 10 };
      
  _.extend(opts, options);
  this.running = true;
  this.loop();
};

// the draw loop
uv.Scene.prototype.loop = function() {
  var that = this,
      start, duration;
  
  if (this.running) {
    start = new Date().getTime();
    
    this.preRender();
    this.refreshDisplays();
    
    duration = new Date().getTime()-start;
    
    this.fps = (1000/duration < that.framerate) ? 1000/duration : that.framerate;
    setTimeout(function() { that.loop(); }, (1000/that.framerate)-duration);
  }
};

uv.Scene.prototype.stop = function(options) {
  this.running = false;
};

// creates a display to make the scene visible
uv.Scene.prototype.display = function(options) {
  var disp = new uv.Display(this, options);
  this.displays.push(disp);
  
  return disp;
};

// Commands
// -----------------------------------------------------------------------------

// command construction and registration
uv.Scene.prototype.register = function(cmd, options) {
  this.commands[cmd.className] = new cmd(this, options);
};

uv.Scene.prototype.execute = function(cmd) {
  this.commands[cmd.className].execute();
}

uv.Scene.prototype.unexecute = function(cmd) {
  this.commands[cmd.className].unexecute();
}

// Refresh displays
uv.Scene.prototype.refreshDisplays = function() {
  _.each(this.displays, function(d) {
    d.refresh();
  });
};



/**********************************************************************
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright (c) 2001 Robert Penner
JavaScript version copyright (c) 2006 by Philippe Maegerman
Adapted to work along with Processing.js (c) 2009 by Michael Aufreiter

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
   * Neither the name of the author nor the names of contributors may
be used to endorse or promote products derived from this software
without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*****************************************/

// uv.Tween = function(obj, prop, func, begin, finish, duration) {
uv.Tween = function(opts) {
  this.prop = opts.property;
  this.obj = opts.obj;
  this.begin = opts.begin || opts.obj[this.prop];
  this._pos = this.begin;
  this.setDuration(opts.duration);
  
  this.func = opts.easer || uv.Tween.strongEaseInOut;
  this.setFinish(opts.finish || opts.obj[this.prop]);
  
  // callbacks
  this.callbacks = {};
  this.callbacks.start = function() {  };
  this.callbacks.finish = function() {  };
};

uv.Tween.prototype = {
  obj: new Object(),
  func: function (t, b, c, d) { return c*t/d + b; },
  begin: 0,
  change: 0,
  prevTime: 0,
  prevPos: 0,
  looping: false,
  _playing: false,
  _duration: 0,
  _time: 0,
  _pos: 0,
  _position: 0,
  _startTime: 0,
  _finish: 0,
  name: '',
  suffixe: '',
  on: function(name, fn) {
    this.callbacks[name] = fn;
  },
  setTime: function(t) {
  	this.prevTime = this._time;
  	if (t > this.getDuration()) {
  		if (this.looping) {
  			this.rewind (t - this._duration);
  			this.update();
  			// execute onLooped callback
  		} else {
  			this._time = this._duration;
  			this.update();
        
        this.stop(); // CHECK!
  		}
  	} else if (t < 0) {
  		this.rewind();
  		this.update();
  	} else {
  		this._time = t;
  		this.update();
  	}
  },
  getTime: function(){
  	return this._time;
  },
  setDuration: function(d){
  	this._duration = (d == null || d <= 0) ? 100000 : d;
  },
  getDuration: function(){
  	return this._duration;
  },
  setPosition: function(p){
  	this.prevPos = this._pos;
  	this.obj[this.prop] = p;
  	this._pos = p;
  	// execute onPositionChanged callback
  },
  getPosition: function(t) {
  	if (t == undefined) t = this._time;
  	return this.func(t, this.begin, this.change, this._duration);
  },
  setFinish: function(f) {
  	this.change = f - this.begin;
  },
  getFinish: function() {
  	return this.begin + this.change;
  },
  isPlaying: function() {
    return this._playing;
  },
  init: function(obj, prop, func, begin, finish, duration, suffixe) {
  	if (!arguments.length) return;
  	this._listeners = new Array();
  	this.addListener(this);
  	this.obj = obj;
  	this.prop = prop;
  	this.begin = begin;
  	this._pos = begin;
  	this.setDuration(duration);
  	if (func!=null && func!='') {
  		this.func = func;
  	}
  	this.setFinish(finish);
  },
  
  start: function() {
  	this.rewind();
  	this._playing = true;
  	this.callbacks.start();
  },
  rewind: function(t) {
  	this.reset();
  	this._time = (t == undefined) ? 0 : t;
  	this.fixTime();
  	this.update();
  },
  fforward: function() {
  	this._time = this._duration;
  	this.fixTime();
  	this.update();
  },
  update: function() {
  	this.setPosition(this.getPosition(this._time));
  },
  tick: function() {
    if (this._playing) {
      this.nextFrame();
    }
  },
  nextFrame: function() {
  	this.setTime((this.getTimer() - this._startTime) / 1000);
  },
  reset: function() {
    this._playing = false;
  },
  stop: function() {
    this._playing = false;    
    this.callbacks.finish();
  },
  continueTo: function(finish, duration) {
  	this.begin = this._pos;
  	this.setFinish(finish);
  	if (this._duration != undefined) {
  		this.setDuration(duration);
  	}
  	this.start();
  },
  resume: function() {
  	this.fixTime();
  	this._playing = true;
  	// executing onResumed callback
  },
  yoyo: function () {
  	this.continueTo(this.begin,this._time);
  },
  fixTime: function() {
  	this._startTime = this.getTimer() - this._time * 1000;
  },
  getTimer: function() {
  	return new Date().getTime() - this._time;
  }
};

// Easing functions
uv.Tween.backEaseIn = function(t,b,c,d,a,p) {
	if (s == undefined) var s = 1.70158;
	return c*(t/=d)*t*((s+1)*t - s) + b;
}

uv.Tween.backEaseOut = function(t,b,c,d,a,p) {
	if (s === undefined) var s = 1.70158;
	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
};

uv.Tween.backEaseInOut = function(t,b,c,d,a,p) {
	if (s == undefined) var s = 1.70158; 
	if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
	return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
};

uv.Tween.elasticEaseIn = function(t,b,c,d,a,p) {
	if (t==0) return b;  
	if ((t/=d)==1) return b+c;  
	if (!p) p=d*.3;
	if (!a || a < Math.abs(c)) {
		a=c; var s=p/4;
	}
	else 
		var s = p/(2*Math.PI) * Math.asin (c/a);

	return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
};

uv.Tween.elasticEaseOut = function (t,b,c,d,a,p) {
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
};

uv.Tween.elasticEaseInOut = function (t,b,c,d,a,p) {
	if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) var p=d*(.3*1.5);
	if (!a || a < Math.abs(c)) {var a=c; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (c/a);
	if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
};

uv.Tween.bounceEaseOut = function(t,b,c,d) {
	if ((t/=d) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
};

uv.Tween.bounceEaseIn = function(t,b,c,d) {
	return c - Tween.bounceEaseOut (d-t, 0, c, d) + b;
};

uv.Tween.bounceEaseInOut = function(t,b,c,d) {
	if (t < d/2) return Tween.bounceEaseIn (t*2, 0, c, d) * .5 + b;
	else return Tween.bounceEaseOut (t*2-d, 0, c, d) * .5 + c*.5 + b;
};

uv.Tween.strongEaseInOut = function(t,b,c,d) {
	return c*(t/=d)*t*t*t*t + b;
};

uv.Tween.regularEaseIn = function(t,b,c,d) {
	return c*(t/=d)*t + b;
};

uv.Tween.regularEaseOut = function(t,b,c,d) {
	return -c *(t/=d)*(t-2) + b;
};

uv.Tween.regularEaseInOut = function(t,b,c,d) {
	if ((t/=d/2) < 1) return c/2*t*t + b;
	return -c/2 * ((--t)*(t-2) - 1) + b;
};

uv.Tween.strongEaseIn = function(t,b,c,d) {
	return c*(t/=d)*t*t*t*t + b;
};

uv.Tween.strongEaseOut = function(t,b,c,d) {
	return c*((t=t/d-1)*t*t*t*t + 1) + b;
};

uv.Tween.strongEaseInOut = function(t,b,c,d) {
	if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
	return c/2*((t-=2)*t*t*t*t + 2) + b;
};
// Bar
// =============================================================================

uv.Bar = function(properties) {
  // super call
  uv.Actor.call(this, _.extend({
    width: 30,
    height: 50,
    strokeWeight: 2,
    strokeStyle: '#000',
    fillStyle: '#ccc'
  }, properties));
};

uv.Bar.prototype = Object.extend(uv.Actor);

uv.Bar.prototype.drawMask = function(ctx) {
  ctx.beginPath();
  
  ctx.moveTo(0, 0);
  ctx.lineTo(this.properties.width, 0);
  ctx.lineTo(this.properties.width, this.properties.height);
  ctx.lineTo(0, this.properties.height);
  ctx.lineTo(0, 0);
  ctx.closePath();
};

uv.Bar.prototype.draw = function(ctx) {
  ctx.fillStyle = this.prop('fillStyle');
  ctx.fillRect(0, 0, this.prop('width'), this.prop('height'));
};

// Label
// =============================================================================
uv.Label = function(properties) {
  // super call
  uv.Actor.call(this, _.extend({
    text: '',
    textAlign: 'start',
    font: '12px Helvetica, Arial'
  }, properties));
};

uv.Label.prototype = Object.extend(uv.Actor);

uv.Label.prototype.draw = function(ctx) {
  ctx.font = this.prop('font');
  ctx.fillStyle = this.prop('fillStyle');
  
  ctx.textAlign = this.prop('textAlign');
  ctx.fillText(this.prop('text'), 0, 0);
};

// Dot
// =============================================================================

uv.Dot = function(properties) {
  // super call
  uv.Actor.call(this, _.extend({
    radius: 20,
    strokeWeight: 2,
    strokeStyle: '#ccc'
  }, properties));
};

uv.Dot.prototype = Object.extend(uv.Actor);

uv.Dot.prototype.draw = function(ctx) {

};

// Abstract Visualization
// ----------------------------------------------------------------------------
// 
// Functionality is shared with all implemented visualizations

uv.Visualization = new Class({
  constructor: function (collection, options) {
      this.collection = collection;
      this.measures = options.measures;
      this.params = options.params;
      this.$canvas = options.canvas || $('#canvas');
      
      // default margin
      this.margin = {top: 20, right: 20, bottom: 20, left: 20};
  },
  // Checks if the constructed instance conforms to the visualization spec
  isValid: function() {
    var that = this,
        idx = 0, // measure index
        valid = true;
    
    // checks for a given measure if it conforms to a given spec
    function isComplient(idx, mspec) {
      var p = that.property(idx);

      // handle optional measures
      if (mspec.optional && !p)
        return true;
      
      return (p && mspec.types.indexOf(p.type) >= 0 && (p.unique === mspec.unique || mspec.unique === undefined));
    }
    
    $.each(this.constructor.spec.measures, function(index, mspec) {
      var count;
      if (mspec.cardinality === "*") {
        count = that.measures.length-idx; // remaining unchecked measures
      } else {
        count = mspec.cardinality;
      }
      for (var i=0; i<count; i++) {
        if (!isComplient(idx, mspec)) {
          valid = false;
        }
        idx += 1;
      }
    });
    
    return idx >= this.measures.length ? valid : false;
  },
  // returns a property object at given index i
  property: function(i) {
    return this.collection.get('properties', this.measures[i]);
  },
  render: function() {
    this.$canvas.html('render() is not implemented.');
  }
});

// export namespace
window.uv = uv;

})(window);
