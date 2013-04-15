var objectFusion = require('object-fusion');

// Generate common value proxies
// Proxy to alias strings to other keys
function aliasProxy(key) {
  // If it is an alias, look it up
  var val = key;
  if (typeof val === 'string') {
    val = this.getValue(key);

    // If the value is not defined, warn the user
    if (!val) {
      console.error('Doubleshot key "' + key + '" could not be found');
    }
  }

  // Return the value
  return val;
}

// Proxy to expand arrays of strings into keys
function expandProxy(val) {
  // If it is an array, expand it
  if (Array.isArray(val)) {
    val = val.map(aliasProxy, this);
  }

  // Return the value
  return val;
}

// Proxy to allow aliasing and expansion
function aliasAndExpandProxy(val) {
  // Attempt to expand strings and arrays
  val = aliasProxy.call(this, val);
  val = expandProxy.call(this, val);

  // Then return
  return val;
}

function fuseOutlines(params) {
  // Load in object fusion and convert batches
  var batches = [],
      content = params.content,
      outline = params.outline,
      outlineArr = outline;

  // Each outline can contain multiple batches
  outlineArr.forEach(function fuseBatches (outline) {
    // If the outline is not an array, make it one
    var outlines = outline;
    if (!Array.isArray(outline)) {
      outlines = [outline];
    }

    // Iterate over the outlines
    outlines.forEach(function fuseOutlines (outline) {
      // Save outline and content fusion as a batch
      var fusedObj = objectFusion({
        outline: outline,
        content: content,
        // TODO: Move to custom proxy which informs user on missing keys
        'value proxy': aliasAndExpandProxy
      });
      batches.push(fusedObj);
    });
  });

  // Return batches
  return batches;
}

// Export fuseOutlines
module.exports = fuseOutlines;