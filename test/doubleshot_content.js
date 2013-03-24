var assert = require('assert');
module.exports = {
  // TODO: Allow for the option to break out a topic into {before, beforeEach, after, afterEach}
  'A test': function () {
    this.one = 1;
  },
  'can be run': function () {
    assert(this.one, 1);
  }
};