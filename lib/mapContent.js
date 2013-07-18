// Load in dependencies
var mergeObjects = require('./mergeObjects');

// Set up and export our function
module.exports = function mapContent () {
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
  var unusedKeys = _.difference(keysListed, keysUsed.concat(['before', 'beforeEach', 'afterEach', 'after']);
  if (unusedKeys.length) {
    console.error('Doubleshot keys "' + unusedKeys.join('", "') + '" were not used');
  }

  // If there were un-found keys, spit them out
  if (keysNotFound.length) {
    console.error('Doubleshot keys "' + keysNotFound.join('", "') + '" were not found');
  }

  // Return the mapped content
  return mappedContent;
};