var assert = require('assert');

module.exports = {
  // First batch
  'One context': function () {
    console.log(this);
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
  'is also isolated2 from other contexts': function () {
    assert.deepEqual(this.context, [1, 2]);
  },
  'is also isolated3 from other contexts': function () {
    assert.deepEqual(this.context, [1, 2]);
  },

  // Second batch
  'Another context': function () {
    this.context = this.context || [];
    this.context.push(3);
  },
  'is isolated from the first context': function () {
    assert.deepEqual(this.context, [3]);
  },
  'another nesting': function () {
    this.context.push(4);
  },
  'is also isolated from the first context': function () {
    assert.deepEqual(this.context, [3, 4]);
  }
};