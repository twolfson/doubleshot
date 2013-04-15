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

  // TODO: Relocate these to a class since we cannot trim them down much more
  // TODO: Better solution is to convert Fuser into Observer pattern and talk to that directly

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

  // TODO: If there are an unused keys, spit them out

  // Return batches
  return batches;
}

// Export fuseOutlines
module.exports = fuseOutlines;