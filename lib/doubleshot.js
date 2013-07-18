// Load in core, node, and local modules
var path = require('path'),
    Mocha = require('mocha'),
    _ = require('underscore'),
    objectFusion2 = require('object-fusion2'),
    mergeObjects = require('./mergeObjects'),
    fuseOutlines = require('./fuseOutlines'),
    renderBatch = require('./renderBatch'),
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

    // If there are any global hooks in the contents, pull them out
    var globalBefore = [],
        globalBeforeEach = [],
        globalAfterEach = [],
        globalAfter = [];
    contentArr.forEach(function pluckGlobalHooks (content) {
      // Pluck out and flatten hooks
      // DEV: Flattening is performed by concat, which coerces arrays of arrays to arrays
      if (content.before) { globalBefore = globalBefore.concat(content.before); }
      if (content.beforeEach) { globalBeforeEach = globalBeforeEach.concat(content.beforeEach); }
      if (content.afterEach) { globalAfterEach = globalAfterEach.concat(content.afterEach); }
      if (content.after) { globalAfter = globalAfter.concat(content.after); }

      // Delete the hooks
      delete content.before;
      delete content.beforeEach;
      delete content.afterEach;
      delete content.after;
    });

    // Combine all content into an single object
    var content = mergeObjects(contentArr);

    // Temporarily save global hooks back to object for mapping
    content.before = globalBefore;
    content.beforeEach = globalBeforeEach;
    content.after = globalAfter;
    content.afterEach = globalAfterEach;

    // Create a value mapper and placeholders for keys used/not found
    var valMapper = new ValueMapper(content),
        keysUsed = [],
        keysNotFound = [];

    // Create helper function for finding the values and saving keys used/not found
    function getValue(key) {
      // Lookup the value by its key
      var valObj = valMapper.lookup(key, {
        alias: true,
        map: true,
        flatten: true,
        middlewares: [function resolveObjectAliases (val) {
          // Prepare return info
          var retVal = val,
              aliasesUsed = [],
              aliasesNotFound = [];

          // If the value is an object, lookup the before, after, etc
          if (typeof val === 'object') {
            // For each of the key types
            // ANTI-PATTERN: We lose a per-item stacktrace by using a forEach loop
            var obj = val;
            ['before', 'beforeEach', 'afterEach', 'after'].forEach(function resolveBeforeEtcAliases (hookName) {
              // If hooks exists
              var hooks = obj[hookName];
              if (hooks !== undefined) {
                // Resolve their value
                content.__doubleshot_tmp = hooks;
                var _key = this.key,
                    valObj = this.lookup('__doubleshot_tmp', {
                      alias: true,
                      map: true,
                      flatten: true,
                      middlewares: [function preventObjectAliasing (val) {
                        // If the value is an object, complain and leave
                        if (typeof val === 'object' && !Array.isArray(val)) {
                          throw new Error('Aliasing within an object to another object is not allowed. Please update "' + _key + '.' + hookName + '" -> "' + this.key + '".');
                        }

                        // Otherwise, return the value
                        return {
                          value: val,
                          aliasesUsed: [],
                          aliasesNotFound: []
                        };
                      }]
                    });
                delete content.__doubleshot_tmp;

                // Save the aliases used and not found
                aliasesUsed.push.apply(aliasesUsed, valObj.aliasesUsed);
                aliasesNotFound.push.apply(aliasesNotFound, valObj.aliasesNotFound);

                // Save the value
                retVal[hookName] = valObj.value;
              }
            }, this);
          }

          // Return our mapped object
          return {
            value: retVal,
            aliasesUsed: aliasesUsed,
            aliasesNotFound: aliasesNotFound
          };
        }]
      });

      // Save the keys used and not found
      keysUsed.push.apply(keysUsed, valObj.aliasesUsed);
      keysNotFound.push.apply(keysNotFound, valObj.aliasesNotFound);

      // Return the value
      return valObj.value;
    }

    // Alias and map all of our keys via ValueMapper
    var mappedContent = {};
    Object.getOwnPropertyNames(content).forEach(function mapContentKey (key) {
      mappedContent[key] = getValue(key);
    });

    // Remove the global items
    globalBefore = mappedContent.before;
    globalBeforeEach = mappedContent.beforeEach;
    globalAfter = mappedContent.after;
    globalAfterEach = mappedContent.afterEach;
    delete mappedContent.before;
    delete mappedContent.beforeEach;
    delete mappedContent.after;
    delete mappedContent.afterEach;

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