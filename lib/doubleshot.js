// Load in core, node, and local modules
var path = require('path'),
    Mocha = require('mocha'),
    _ = require('underscore'),
    objectFusion2 = require('object-fusion2'),
    mergeObjects = require('./mergeObjects'),
    fuseOutlines = require('./fuseOutlines'),
    renderBatch = require('./renderBatch'),
    _ = require('underscore'),
    ValueMapper = require('value-mapper');

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
  this.files = {
    outlines: [],
    contents: []
  };
}

// Alias Doubleshot to exports for Mocha semantics
var exports = Doubleshot;

// Duck punch over Mocha's prototype
Doubleshot.prototype = _.defaults({
  // Helper methods to add outlines and content
  addOutline: function (file) {
    this.files.outlines.push(file);
    return this;
  },
  addContent: function (file) {
    this.files.contents.push(file);
    return this;
  },

  // Define loadBatches, a modified loadFiles for doubleshot
  loadFiles: function (fn) {
    // Load in files
    var files = this.files,
        outlineArr = files.outlines.map(require),
        contentArr = files.contents.map(require);

    // Combine all content into an single object
    var content = mergeObjects(contentArr);

    // Create placeholder for keys used and not used
    var keysUsed = [],
        keysNotFound = [];

    // Alias and expand all of our keys via ValueMapper
    var valMapper = new ValueMapper(content),
        mappedContent = {};
    Object.getOwnPropertyNames(content).forEach(function (key) {
      // Lookup the value by its key
      var valObj = valMapper.lookup(key, {
        alias: true,
        expand: true,
        flatten: true
      });

      // Save the keys used and not found
      keysUsed.push.apply(keysUsed, valObj.aliasesUsed);
      keysNotFound.push.apply(keysNotFound, valObj.aliasesNotFound);

      // Save the value to the mapped content
      mappedContent[key] = valObj.value;
    });

    // If there are any global hooks in the contents, pull them out
    var globalBefore = [],
        globalBeforeEach = [],
        globalAfterEach = [],
        globalAfter = [];
    contentArr.forEach(function pluckGlobalHooks (content) {
      // Pluck out and flatten hooks
      if (mappedContent.before) { globalBefore = globalBefore.concat(mappedContent.before); }
      if (mappedContent.beforeEach) { globalBeforeEach = globalBeforeEach.concat(mappedContent.beforeEach); }
      if (mappedContent.afterEach) { globalAfterEach = globalAfterEach.concat(mappedContent.afterEach); }
      if (mappedContent.after) { globalAfter = globalAfter.concat(mappedContent.after); }

      // Delete the hooks
      delete mappedContent.before;
      delete mappedContent.beforeEach;
      delete mappedContent.afterEach;
      delete mappedContent.after;
    });

    // Save the listed keys
    var keysListed = Object.getOwnPropertyNames(mappedContent);

    // Fuse outlines with content and into batches
    var batchObj = fuseOutlines({
          content: mappedContent,
          outline: outlineArr
        }),
        batches = batchObj.batches;

    // Save the keys used and keys not found
    keysUsed.push.apply(keysUsed, batchObj.keysUsed);
    keysNotFound.push.apply(keysNotFound, batchObj.keysNotFound);

    // If there are an unused keys, spit them out
    var unusedKeys = _.difference(keysListed, keysUsed);
    if (unusedKeys.length) {
      console.error('Doubleshot keys "' + unusedKeys.join('", "') + '" were not used');
    }

    // If there were un-found keys, spit them out
    if (keysNotFound.length) {
      console.error('Doubleshot keys "' + keysNotFound.join('", "') + '" were not found');
    }

    // DEV: Barely modified `mocha.prototype.loadFiles`
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

    // After each batch runs, clean up context
    // https://github.com/twolfson/doubleshot/issues/5
    suite.suites.forEach(function bindCleanup (suite) {
      suite.afterAll(function cleanupContext () {
        var key;
        for (key in this) {
          delete this[key];
        }
      });
    });

    // Iterate over the global hooks and attach them
    globalBefore.forEach(suite.beforeAll, suite);
    globalBeforeEach.forEach(suite.beforeEach, suite);
    globalAfterEach.forEach(suite.afterEach, suite);
    globalAfter.forEach(suite.afterAll, suite);

    if (fn) { fn(); }
  },

  // Overload mocha.run to sniff `this.files.outlines` and `this.files.contents`
  run: function(fn){
    if (this.files.outlines.length && this.files.contents.length) { this.loadFiles(); }
    var suite = this.suite;
    var options = this.options;
    var runner = new exports.Runner(suite);
    var reporter = new this._reporter(runner);
    runner.ignoreLeaks = false !== options.ignoreLeaks;
    runner.asyncOnly = options.asyncOnly;
    if (options.grep) { runner.grep(options.grep, options.invert); }
    if (options.globals) { runner.globals(options.globals); }
    if (options.growl) { this._growl(runner, reporter); }
    return runner.run(fn);
  }
}, Mocha.prototype);

// Delete the original `addFile` function since it no longer applies
delete Doubleshot.prototype.addFile;

// Expose custom items on Doubleshot
_.extend(Doubleshot, {
  // Expose object fusion
  objectFusion2: objectFusion2,

  // Expose all helpers
  mergeObjects: mergeObjects,
  fuseOutlines: fuseOutlines,
  renderBatch: renderBatch

// and duck punch over Mocha' static methods/properties
}, Mocha);

// Expose doubleshot
module.exports = Doubleshot;