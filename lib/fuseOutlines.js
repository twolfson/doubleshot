var assert = require('assert'),
    objectFusion2 = require('object-fusion2');

function fuseOutlines(params) {
  // Load in object fusion and convert batches
  var batches = [],
      content = params.content,
      outline = params.outline,
      outlineArr = outline;

  // Each outline can contain multiple batches
  var keysUsed = [],
      keysNotFound = [];
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

  // Return batches
  return {
    batches: batches,
    keysUsed: keysUsed,
    keysNotFound: keysNotFound
  };
}

// Export fuseOutlines
module.exports = fuseOutlines;