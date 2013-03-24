var objectFusion = require('object-fusion'),
    expandProxy = objectFusion.aliasAndExpandProxy;
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
        'value proxy': function valueProxyFn (val) {
          // Expand normally
          var retVal = expandProxy.call(this, val);

          // If there is no value, warn the user
          if (!retVal) {
            console.warn('Non-existant doubleshot content, "' + val + '",  being requested');
          }

          // Return the retVal
          return retVal;
        }
      });
      batches.push(fusedObj);
    });
  });

  // Return batches
  return batches;
}

// Export fuseOutlines
module.exports = fuseOutlines;