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
    this.sum3 = 3;
  },
  'minus two': function () {
    this.sum3 -= 2;
  },
  'can run properly': function () {
    assert.strictEqual(this.sum3, 1);
  }
};