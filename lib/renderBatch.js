// Recursively render batches
// Receives {'A test': {value: fn, child: {subnode}}
function renderBatch(batch) {
  // Iterate over the values of the batch
  var contextNames = Object.getOwnPropertyNames(batch);
  contextNames.forEach(function recursivelyRender (contextName) {
    // Open the next context
    var context = batch[contextName],
        description = contextName,
        child = context.child,
        value = context.value,
        fns;

    // If there is no child, we are on a leaf
    if (!child) {
      // If the value is an array, run all of them in series
      if (Array.isArray(value)) {
        fns = value;
        it(description, function handleMultipleIts () {
          // TODO: Handle async fns
          var that = this;
          fns.forEach(function (fn) {
            fn.call(that);
          });
        });
      } else {
      // Otherwise, describe and execute `it`
        it(description, value);
      }
    } else {
    // Otherwise, we are on a parent node
      // If there is a value, act on it
      if (value) {
        // If it is an array, run all of them in series
        if (Array.isArray(value)) {
          fns = value;
          // TODO: When implementing after/beforeEach/afterEach, create an array for each type -- then do looping in there
          // TODO: We also should be able to use the same logic for before/it looping
          before(function handleMultipleBefore () {
            // TODO: Handle async fns
            var that = this;
            fns.forEach(function (fn) {
              fn.call(that);
            });
          });
        } else {
        // Otherwise, call it
          before(value);
        }
      }

      // Keep on diving on the child
      describe(description, function execRecursiveRender () {
        return renderBatch.call(this, child);
      });
    }
  });
}

// Export renderBatch
module.exports = renderBatch;