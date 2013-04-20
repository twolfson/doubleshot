var assert = require('assert');
module.exports = {
  'A test': function () {
    this.sum = 1;
  },
  'can be run': function () {
    assert.strictEqual(this.sum, 1);
  },
  'using aliasing': 'copy sum',
  'copy sum': function () {
    this.sum2 = this.sum;
  },
  'runs': function () {
    assert.strictEqual(this.sum2, 1);
  },
  'A test using expansion': ['Three', 'minus two'],
  'Three': function () {
    this.sum3 = 3;
  },
  'minus two': function () {
    this.sum3 -= 2;
  },
  'can run properly': function () {
    assert.strictEqual(this.sum3, 1);
  },
  'A test using async expansion': ['Async', 'expansion'],
  'Async': function (done) {
    var that = this;
    setTimeout(function () {
      that.asyncA = true;
      done();
    }, 1);
  },
  'expansion': function (done) {
    var that = this;
    setTimeout(function () {
      that.asyncB = that.asyncA;
      done();
    }, 1);
  },
  'still completes': function () {
    assert.strictEqual(this.asyncB, true);
  }
};