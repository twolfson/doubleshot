var assert = require('assert');
module.exports = {
  // TODO: Allow for the option to break out a topic into {before, beforeEach, after, afterEach}
  'A test': function () {
    console.log('hey', arguments);
    this.one = 1;
  },
  'can be run': function () {
    console.log('heybbb');
    assert(this.one, 1);
  }
};