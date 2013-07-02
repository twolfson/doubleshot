var assert = require('assert'),
    objectMapper = require('object-mappr'),
    objectFusion2 = require('object-fusion2'),
    _ = require('underscore');

function fuseOutlines(params) {
  // Load in object fusion and convert batches
  var batches = [],
      content = params.content,
      outline = params.outline,
      outlineArr = outline;

  // Map the content against itself
  content = objectMapper(content, {
    alias: true,
    map: true,
    flatten: true
  });

  // Create placeholder for keys used and not used
  var keysListed = Object.getOwnPropertyNames(content),
      keysUsed = [],
      keysNotFound = [];

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
        content: content,
        events: {
          // TODO: Deal with this
          // When there is a key missing, notify the user
          'value key not found': function (key) {
            keysNotFound.push(key);
          },
          // When a key is used, record it
          'value key used': function (key) {
            keysUsed.push(key);
          }
        }
      });
      batches.push(fusedObj);
    });
  });

  // // If there are an unused keys, spit them out
  // var unusedKeys = _.difference(keysListed, keysUsed);
  // if (unusedKeys.length) {
  //   console.error('Doubleshot keys "' + unusedKeys.join('", "') + '" were not used');
  // }

  // // If there were un-found keys, spit them out
  // if (keysNotFound.length) {
  //   console.error('Doubleshot keys "' + keysNotFound.join('", "') + '" were not found');
  // }

  // Return batches
  return batches;
}

// Export fuseOutlines
module.exports = fuseOutlines;