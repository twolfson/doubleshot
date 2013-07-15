var assert = require('assert'),
    objectFusion2 = require('object-fusion2'),
    _ = require('underscore'),
    ValueMapper = require('./valueMapper');

function fuseOutlines(params) {
  // Load in object fusion and convert batches
  var batches = [],
      content = params.content,
      outline = params.outline,
      outlineArr = outline;

  // Create placeholder for keys used and not used
  var keysListed = Object.getOwnPropertyNames(content),
      keysUsed = [],
      keysNotFound = [];

  // Alias and expand all of our keys via ValueMapper
  var valMapper = new ValueMapper(content),
      mappedContent = {};
  keysListed.forEach(function (key) {
    // Lookup the value by its key
    var valObj = valMapper.lookup(key, {
      alias: true,
      expand: true,
      flatten: true
    });

    // Remove the current key from keysUsed
    var keysUsed = valObj.keysUsed;
    keysUsed.splice(keysUsed.indexOf(key), 0, 1);

    // Save the keys used and not found
    keysUsed.push.apply(keysUsed, valObj.keysUsed);
    keysNotFound.push.apply(keysNotFound, valObj.keysNotFound);

    // Save the value to the mapped content
    mappedContent[key] = valObj.value;
  });

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
      var fusedObj = objectFusion2({
        outline: outline,
        content: mappedContent,
        events: {
          // When a key is used, record it
          'value key used': function (key) {
            keysUsed.push(key);
          }
        }
      });
      batches.push(fusedObj);
    });
  });

  // If there are an unused keys, spit them out
  var unusedKeys = _.difference(keysListed, keysUsed);
  if (unusedKeys.length) {
    console.error('Doubleshot keys "' + unusedKeys.join('", "') + '" were not used');
  }

  // If there were un-found keys, spit them out
  if (keysNotFound.length) {
    console.error('Doubleshot keys "' + keysNotFound.join('", "') + '" were not found');
  }

  // Return batches
  return batches;
}

// Export fuseOutlines
module.exports = fuseOutlines;