// Load in core, node, and local modules
var path = require('path'),
    Mocha = require('mocha'),
    _ = require('underscore'),
    objectFusion = require('object-fusion'),
    mergeObjects = require('./mergeObjects'),
    fuseOutlines = require('./fuseOutlines'),
    renderBatch = require('./renderBatch');

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

  // Set up store for outlines and content
  this.outlineArr = [];
  this.contentArr = [];
}

// Alias Doubleshot to exports for Mocha semantics
var exports = Doubleshot;

// Duck punch over Mocha's prototype
Doubleshot.prototype = _.defaults({
  // TODO: Get off of loadFiles and rename to loadBatches
  // Helper methods to add outlines and content
  addOutline: function (outline) {
    this.outlineArr.push(outline);
  },
  addContent: function (content) {
    this.contentArr.push(content);
  },

  // Define loadBatches, a modified loadFiles for doubleshot
  loadBatches: function (fn) {
    // Combine all content into an single object
    var content = mergeObjects(this.contentArr);

    // Fuse outlines with content and into batches
    var batches = fuseOutlines({
          content: content,
          outline: this.outlineArr
        });

    console.log(batches);

    // DEV: Barely modified `mocha.prototyp.loadFiles`
    var self = this;
    var suite = this.suite;
    batches.forEach(function(batch){
      // TODO: Revisit this -- we cannot use filenames by index
      // since there can be multiple batches in a file
      var file = 'null';
      suite.emit('pre-require', global, file, self);
      suite.emit('require', renderBatch(batch), file, self);
      suite.emit('post-require', global, file, self);
      console.log('next!');
    });
    if (fn) { fn(); }
  },

  // Overload mocha.run to use `loadBatches
  run: function(fn){
    if (this.outlineArr.length && this.contentArr.length) this.loadBatches();
    var suite = this.suite;
    var options = this.options;
    var runner = new exports.Runner(suite);
    var reporter = new this._reporter(runner);
    runner.ignoreLeaks = false !== options.ignoreLeaks;
    runner.asyncOnly = options.asyncOnly;
    if (options.grep) runner.grep(options.grep, options.invert);
    if (options.globals) runner.globals(options.globals);
    if (options.growl) this._growl(runner, reporter);
    return runner.run(fn);
  }
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