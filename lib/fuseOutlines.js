var objectFusion = require('object-fusion'),
    aliasAndExpandProxy = objectFusion.aliasAndExpandProxy,
    _ = require('underscore');

function fuseOutlines(params) {
  // Load in object fusion and convert batches
  var batches = [],
      content = params.content,
      outline = params.outline,
      outlineArr = outline;

  // Create placeholder for keys used and not used
  var keysListed = Object.getOwnPropertyNames(content),
      keysUsed = [];

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
        'value proxy': aliasAndExpandProxy,
        events: {
          // When there is a key missing, notify the user
          'value key not found': function (key) {
            console.error('Doubleshot key "' + key + '" could not be found');
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

  // If there are an unused keys, spit them out
  var unusedKeys = _.difference(keysListed, keysUsed);
  if (unusedKeys.length) {
    console.error('Doubleshot keys "' + unusedKeys.join('", "') + '" were not used');
  }

  // Return batches
  return batches;
}

// Export fuseOutlines
module.exports = fuseOutlines;