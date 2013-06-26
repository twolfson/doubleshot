// Recursively render batches
// Receives {'A test': {value: fn, child: {subnode}}
var async = require('async');
function renderBatch(batch) {
  // Localize batch info
  var description = batch.nodeName,
      value = batch.value,
      childNodes = batch.childNodes,
      fns;

  // If there are no children, we are on a leaf
  if (!childNodes) {
    // If the value is an array, run all of them in series
    if (Array.isArray(value)) {
      fns = value;
      // TODO: Conditionally require a callback
      it(description, function handleMultipleIts (done) {
        // TODO: See if it is possible to clear mocha's timer
        // Iterate the functions in order
        var that = this;
        async.forEachSeries(fns, function (fn, cb) {
          // If the function is async, pass it a callback
          if (fn.length) {
            fn.call(that, cb);
          } else{
          // Otherwise, run it and call the callback
            fn.call(that);
            cb(null);
          }
        }, done);
      });
    } else {
    // Otherwise, describe and execute `it`
      it(description, value);
    }
  } else {
  // Otherwise, we are on a parent node
    // Describe this context
    describe(description, function execRecursiveRender () {
      // If there is a value, act on it
      if (value) {
        // Cast the values to an array
        var values = value;
        if (!Array.isArray(values)) {
          values = [value];
        }

        // Iterate over the values
        values.forEach(function invokeValueHooks (value) {
          // Run the value as a `before`
          // DEV: `mocha` will handle the async and sync timings =3
          var fn = value;
          before(fn);
        });
      }

      // Execute each of the children
      childNodes.forEach(renderBatch, this);
    });
  }
}

// Export renderBatch
module.exports = renderBatch;