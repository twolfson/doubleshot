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
        // If it is an array, run all of them in series
        if (Array.isArray(value)) {
          fns = value;
          // TODO: When implementing after/beforeEach/afterEach, create an array for each type -- then do looping in there
          // TODO: We also should be able to use the same logic for before/it looping
          before(function handleMultipleBefore (done) {
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
        // Otherwise, call it
          before(value);
        }
      }

      // Execute each of the children
      childNodes.forEach(renderBatch, this);
    });
  }
}

// Export renderBatch
module.exports = renderBatch;