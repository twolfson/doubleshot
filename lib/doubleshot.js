// Load in modules and helpers
var Mocha = require('mocha'),
    _ = require('underscore'),
    objectFusion = require('object-fusion'),
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
function Doubleshot(params) {
  // Invoke mocha
  Mocha.call(this, params);
  // // Localize variables from params
  // var outlineArr = params.outlines,
  //     contentArr = params.content;

  // // Combine all content into an single object
  // var content = mergeObjects(contentArr);

  // // Fuse outlines with content and into batches
  // var batches = fuseOutlines({
  //       content: content,
  //       outline: outlineArr
  //     });

  // // Overload loadFiles to use our rendered files
  //     path = require('path');
  // Mocha.prototype.loadFiles = function doubleshotLoadFiles (fn) {
  //   var self = this;
  //   var suite = this.suite;
  //   batches.forEach(function(batch){
  //     // TODO: Revisit this -- we cannot use filenames by index
  //     // since there can be multiple batches in a file
  //     var file = 'null';
  //     suite.emit('pre-require', global, file, self);
  //     suite.emit('require', renderBatch(batch), file, self);
  //     suite.emit('post-require', global, file, self);
  //   });
  //   if (fn) { fn(); }
  // };

  // // Load in mocha's binary file
  // require('mocha/bin/_mocha');
}

// Duck punch over Mocha's prototype
Doubleshot.prototype = _.defaults({

}, Mocha.prototype);

// Expose custom items on Doubleshot
_.extend(Doubleshot, {
  // Expose object fusion
  objectFusion: objectFusion,

  // Expose all helpers
  mergeObjects: mergeObjects,
  fuseOutlines: fuseOutlines,
  renderBatch: renderBatch

// and duck punch over Mocha' static methods/properties
}, Mocha);

// Expose doubleshot
module.exports = Doubleshot;