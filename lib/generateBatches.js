// Load in dependencies
var _ = require('underscore'),
    mapContent = require('./mapContent'),
    fuseOutlines = require('./fuseOutlines');

// Return our generateBatches function
module.exports = function generateBatches (outlineArr, contentArr) {
  // Map content
  var mappedObj = mapContent(contentArr),
      mappedContent = mappedObj.content,
      keysUsed = mappedObj.keysUsed,
      keysNotFound = mappedObj.keysNotFound;

  // Stash the global items off of the mapped
  var globalHooks = {
        before: mappedContent.before,
        beforeEach: mappedContent.beforeEach,
        afterEach: mappedContent.afterEach,
        after: mappedContent.after
      };
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

  // Return the batches and global hooks
  return {
    batches: batches,
    globalHooks: globalHooks
  };
};