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

  // Create inner value mapper
  var hookMapper = new ValueMapper(content, {
        middlewares: [
          'alias',
          'map',
          'flatten',
          function preventObjectAliasing (val) {
            // If the value is an object, complain and leave
            if (typeof val === 'object' && !Array.isArray(val)) {
              throw new Error('Aliasing within an object to another object is not allowed. Please update "' + hookMapper.key + '.' + hookMapper.hookName + '" -> "' + this.key + '".');
            }

            // Otherwise, return the value
            return {
              value: val,
              aliasesUsed: [],
              aliasesNotFound: []
            };
          }
        ]
      });

  /**
    Create a value mapper.
    Cases are hard. Here are some commons and rares:

    {
      'Aliasing': 'a',
      'a': 'b'
    }

    {
      'Object based aliasing': {
        before: 'a'
      },
      'a': 'b'
    }

    {
      'Object based chaining': [{
        before: 'c'
      }, {
        before: 'd'
      }],
      'c': 'u',
      'd': 'v'
    }

    {
      'Object based chaining': [{
        before: ['c']
      }, {
        before: 'd'
      }],
      'c': 'u',
      'd': 'v'
    }

    Current strategy:
      Lookup item by key (a)
        If the value is an array
          If any item is an object
            Lookup each object (a)
              # keys/functions will already have been aliased
            Upcast non-objects into objects
            Collect items into a super-object {before[], after[], ...}
        Otherwise
          Lookup the item (b)
            If the item is an object and we are aliasing to an object, error out
   */
  var valMapper = new ValueMapper(content, {
        middlewares: [
          'alias',
          'map',
          'flatten',
          function resolveArrays (val) {
            // Prepare return info
            var retVal = val,
                aliasesUsed = [],
                aliasesNotFound = [];

            // If the value is an array
            if (Array.isArray(val)) {
              // If the array contains an object
              var containsObj = val.some(function isAnObject (item) {
                    return typeof item === 'object' && !Array.isArray(item);
                  });
              if (containsObj) {
                // Look up each item
                var mappedItems = val.map(function lookupItem (item) {
                      // If the item is not an object, upcast and return it as an object
                      if (typeof item !== 'object') {
                        return {
                          value: {before: item},
                          aliasesUsed: [],
                          aliasesNotFound: []
                        };
                      }

                      // Otherwise, lookup and return the valueObj for the item
                      return this.process(item);
                    }, this);

                // Prepare retVal as a large object
                retVal = {
                  before: [],
                  beforeEach: [],
                  afterEach: [],
                  after: []
                };

                // For each of the mapped values
                /**
                  function () {

                  }

                  {
                    before: function () {
                    }
                  }

                  {
                    before: [function () {
                    }]
                  }
                 */
                mappedItems.forEach(function normalizeToArray (valObj) {
                  // For each of the hook types
                  // ANTI-PATTERN: We lose a per-item stacktrace by using a forEach loop
                  var obj = valObj.value;
                  ['before', 'beforeEach', 'afterEach', 'after'].forEach(function resolveBeforeEtcAliases (hookName) {
                    // If hook exists
                    var hook = obj[hookName];
                    if (hook !== undefined) {
                      // Normalize it to an array
                      if (!Array.isArray(hook)) {
                        hook = [hook];
                      }

                      // Concatenate our array to the retVal hook
                      retVal[hookName].push.apply(retVal[hookName], hook);
                    }
                  });

                  // Save the aliases used and not found
                  aliasesUsed.push.apply(aliasesUsed, valObj.aliasesUsed);
                  aliasesNotFound.push.apply(aliasesNotFound, valObj.aliasesNotFound);
                });
              }
            }

            // Return our mapped object
            return {
              value: retVal,
              aliasesUsed: aliasesUsed,
              aliasesNotFound: aliasesNotFound
            };
          },
          function resolveObjectAliases (val) {
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
                // If hook exists
                var hook = obj[hookName];
                if (hook !== undefined) {
                  // Save info
                  hookMapper.key = this.key;
                  hookMapper.hookName = hookName;

                  // Process the hook values via the mapper
                  valObj = hookMapper.process(hook);

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
          }
        ]
      });

  // Create helper function for finding the values and saving keys used/not found
  var keysUsed = [],
      keysNotFound = [];
  function getValue(key) {
    // Lookup the value by its key
    var valObj = valMapper.lookup(key);

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