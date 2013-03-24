var assert = require('assert');
module.exports = {
  'A test': function () {
    this.sum = 1;
  },
  'can be run': function () {
    assert.strictEqual(this.sum, 1);
  },
  'can use aliasing': 'can be run',
  'A test using expansion': ['Three', 'minus two'],
  'Three': function () {
    this.sum = 3;
  },
  'minus two': function () {
    this.sum -= 2;
  },
  'An isolated test': function () {
    this.isolationA = true;
    this.sum = 1;
  },
  // Interesting... this is failing
  // Try a proof of concept with mocha to see if this is normal behavior
  'Another isolated test': function () {
  },
  'is isolated from its peers': function () {
    assert.notEqual(this.isolationA, true);
  }
};