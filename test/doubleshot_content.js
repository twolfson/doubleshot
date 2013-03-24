var assert = require('assert');
module.exports = {
  'A test': function () {
    this.one = 1;
    console.log('xx', this.one);
  },
  'can be run': function () {
    console.log(this.one);
    assert.strictEqual(this.one, 1);
  }
};