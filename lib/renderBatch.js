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
        value = context.value;

    // If there is no child, we are on a leaf
    if (!child) {
      // Describe and execute `it`
      it(description, value);
    } else {
    // Otherwise, we are on a parent node
      // If there is a value, act on it
      if (value) {
        // TODO: We might expand values to handle before/after/beforeEach/afterEach
        before(value);
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