var assert = require('assert');

module.exports = {
  // First batch
  'One context': function () {
    this.context = this.context || [];
    this.context.push(1);
  },
  'is isolated from other contexts': function () {
    assert.deepEqual(this.context, [1]);
  },
  'nested': function () {
    this.context.push(2);
  },
  'is also isolated from other contexts': function () {
    assert.deepEqual(this.context, [1, 2]);
  },
  'but is not isolated from its own context': function () {
    assert.deepEqual(this.context, [1, 2]);
  }
};