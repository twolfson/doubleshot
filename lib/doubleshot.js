// Load in modules and helpers
var objectFusion = require('object-fusion'),
    mergeObjects = require('./mergeObjects'),
    fuseOutlines = require('./fuseOutlines'),
    renderBatch = require('./renderBatch');

// TODO: Consider making this a constructor -- I have no idea how to handle CLI worries
// TODO: Add `addBatch` and `loadBatches` method to mocha which does the emit requires
// TODO: Overload `mocha.run` to call loadBatches
/**
 * Wrapper for mocha which allows for separate outline and content
 * When run it invokes, the CLI portion of mocha
 * @param {Object} params Container for options
 * @param {Object[]} params.outlines Array of objects outlining each test
 * @param {Object[]} params.content Array of objects with values corresponding to test descriptions
 */
function doubleshot(params) {
  // Localize variables from params
  var outlineArr = params.outlines,
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
    batches.forEach(function(batch){
      // TODO: Revisit this -- we cannot use filenames by index
      // since there can be multiple batches in a file
      var file = 'null';
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

// Expose doubleshot
module.exports = doubleshot;

// DEV: Export Mocha
module.exports = require('mocha');