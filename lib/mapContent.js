// Load in dependencies
var ValueMapper = require('value-mapper'),
    mergeObjects = require('./mergeObjects');

// Set up and export our function
module.exports = function mapContent (contentArr) {
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

        // If the value is an object, upcast it to an array
        if (typeof val === 'object' && !Array.isArray(val)) {
          val = [val];
        }
console.log(val);
        // If the value is an array
        if (Array.isArray(val)) {
          // Map each value
          retVal = val.map(function (val) {
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

            // Return the object
            return obj;
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

  // Return the mapped content and meta info
  return {
    content: mappedContent,
    keysUsed: keysUsed,
    keysNotFound: keysNotFound
  };
};