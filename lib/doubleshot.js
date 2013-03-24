// TODO: Move these into bin
// TODO: Probably want nopt for this due to `remain` functionality
// TODO: CLI should read `doubleshot`
// TODO: CLI should read `doubleshot test`
// TODO: CLI should read `doubleshot --outline test/outline --content test/content`
// TODO: Load in files
// TODO: Use glob against pattern passed in
var outlineFiles = [__dirname + '/../test/doubleshot_outline'],
    contentFiles = [__dirname + '/../test/doubleshot_content'],
    outlineArr2 = outlineFiles.map(require),
    contentArr2 = contentFiles.map(require);

// Start non-cli part here

// Load in modules and helpers
var objectFusion = require('object-fusion'),
    mergeObjects = require('./mergeObjects'),
    fuseOutlines = require('./fuseOutlines'),
    renderBatch = require('./renderBatch');

function doubleshot(params) {
  // Localize variables from params
  var outlineArr = params.outline,
      contentArr = params.content;

  // Combine all content into an single object
  var content = mergeObjects(contentArr);

  // Fuse outlines with content and into batches
  var batches = fuseOutlines({
        content: content,
        outline: outlineArr
      });

  // Overload loadFiles to use our rendered files
  var Mocha = require('mocha'),
      path = require('path');
  Mocha.prototype.loadFiles = function doubleshotLoadFiles (fn) {
    var self = this;
    var suite = this.suite;
    batches.forEach(function(batch, i){
      file = path.resolve(outlineFiles[i]);
      suite.emit('pre-require', global, file, self);
      suite.emit('require', renderBatch(batch), file, self);
      suite.emit('post-require', global, file, self);
    });
    if (fn) { fn(); }
  };

  // Load in mocha's binary file
  require('mocha/bin/_mocha');
}

// Expose object fusion
doubleshot.objectFusion = objectFusion;

// Expose all helpers
doubleshot.mergeObjects = mergeObjects;
doubleshot.fuseOutlines = fuseOutlines;
doubleshot.renderBatch = renderBatch;

// CLI invocation
doubleshot({
  outline: outlineArr2,
  content: contentArr2
});
