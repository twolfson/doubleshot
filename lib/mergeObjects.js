var _ = require('underscore');
function mergeObjects(objArr) {
  // Combine all objects into an single object
  var retObj = objArr.reduce(function reduceContent (a, b) {
    return _.extend(a, b);
  }, {});
  return retObj;
}

// Export mergeObjects
module.exports = mergeObjects;