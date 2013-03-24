// TODO: Move these into bin
// TODO: Probably want nopt for this due to `remain` functionality
// TODO: CLI should read `doubleshot`
// TODO: CLI should read `doubleshot test`
// TODO: CLI should read `doubleshot --outline test/outline --content test/content`
// TODO: Load in files
// TODO: Use glob against pattern passed in
var outlineFiles = [__dirname + '/../test/doubleshot_outline'],
    contentFiles = [__dirname + '/../test/doubleshot_content'],
    outlineArr = outlineFiles.map(require),
    contentArr = contentFiles.map(require);

// Start non-cli part here

// TODO: Move into utility
var _ = require('underscore');
function mergeObjects(objArr) {
  // Combine all objects into an single object
  var retObj = objArr.reduce(function reduceContent (a, b) {
    return _.extend(a, b);
  }, {});
  return retObj;
}

// Combine all content into an single object
var content = mergeObjects(contentArr);

// TODO: Move into utility
var objectFusion = require('object-fusion');
function fuseOutlines(params) {
  // Load in object fusion and convert batches
  var batches = [],
      content = params.content,
      outline = params.outline,
      outlineArr = outline;

  // If outlineArr is not an array, cast it as one
  if (!Array.isArray(outlineArr)) {
    outlineArr = [outline];
  }

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
        'value proxy': objectFusion.aliasAndExpandProxy
      });
      batches.push(fusedObj);
    });
  });

  // Return batches
  return batches;
}

var batches = fuseOutlines({
      content: content,
      outline: outlineArr
    });

// TODO: Expose objectFusion

// TODO: Move into own file
// Recursively render batches
// Receives {'A test': {value: fn, child: {subnode}}
function render(batch) {
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
        return render.call(this, child);
      });
    }
  });
}

function doubleshot(params) {
  // Overload loadFiles to use our rendered files
  var Mocha = require('mocha'),
      path = require('path');
  Mocha.prototype.loadFiles = function (fn) {
    var self = this;
    var suite = this.suite;
    batches.forEach(function(batch, i){
      file = path.resolve(outlineFiles[i]);
      suite.emit('pre-require', global, file, self);
      suite.emit('require', render(batch), file, self);
      suite.emit('post-require', global, file, self);
    });
    if (fn) { fn(); }
  };

  // Load in mocha's binary file
  require('mocha/bin/_mocha');
}
doubleshot({
  outline: outlineArr,
  content: contentArr
});
