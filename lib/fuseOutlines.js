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

  // So the issue we are having:
  // We are doing a mapping pre-emptively which is great
  // since this is re-usble in other stages (e.g. before chaining/after chaining)
  // Unfortunately, when we do this mapping, we lose the state of which keys were mapped to what
  // Previous solutions were integrated and new the state of all things
  // and even emitted events for when keys were used

  // There are a few choices
  // Move to an event emitter model for object-mappr (need to see how this will play with `after` and such)
  // Use different utilities for local and global (no-go, needs to be unified)
  // Stop outputting warnings (fuck that, doubleshot is unusable at that point)

  // TODO: Look at notes on this issue for conversion to see if we had any revelations

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