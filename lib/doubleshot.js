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

// TODO: Come back to this
// // Combine all content into an single object
// var _ = require('underscore'),
//     content = contentArr.reduce(_.extend, {});
// console.log(content);

var content = contentArr[0];

// Load in object fusion
var objectFusion = require('object-fusion'),
    // TODO: Don't do this hardcoded array
    batches = [objectFusion({
      // TODO: Don't do this hardcoded [0]
      outline: outlineArr[0][0],
      content: content,
      // TODO: Move to custom proxy which informs user on missing keys
      'value proxy': objectFusion.aliasAndExpandProxy
    })];


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
    console.log('zzz', description, 'yyy', child);
    if (!child) {
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