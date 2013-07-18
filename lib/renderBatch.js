// Recursively render batches
// Receives {'A test': [{nodeName:'myContext', value: fn, child: {subContext}}]}
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
        // Iterate the functions in order
        var that = this;
        async.forEachSeries(fns, function (fn, cb) {
          // Clear the timeout
          that.runnable().resetTimeout();

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
        // If the value is not an object, upcast them to an object
        var valObj = value;
        if (typeof value !== 'object' || Array.isArray(value)) {
          valObj = {before: value};
        }

        console.log('zz', valObj);

        // Run all the hooks that exist
        // DEV: In all cases, `mocha` will handle the async and sync timings =3
        var beforeFns = valObj.before;
        if (valObj.before) {
          // Upcast it to an array
          if (!Array.isArray(beforeFns)) {
            beforeFns = [beforeFns];
          }

          // Call each of the functions with before
          beforeFns.forEach(before);
        }
        var afterFns = valObj.after;
        if (valObj.after) {
          // Upcast it to an array
          if (!Array.isArray(afterFns)) {
            afterFns = [afterFns];
          }

          // Call each of the functions with after
          afterFns.forEach(after);
        }
        // if (valObj.beforeEach) { beforeEach(valObj.beforeEach); }
        // if (valObj.afterEach) { afterEach(valObj.afterEach); }
        // if (valObj.after) { after(valObj.after); }
      }

      // Execute each of the children
      childNodes.forEach(renderBatch, this);
    });
  }
}

// Export renderBatch
module.exports = renderBatch;