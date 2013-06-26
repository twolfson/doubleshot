var assert = require('assert');
module.exports = {
  // Basic tests
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
  },

  // Kitchen sink test
  'One context': function () {
    this.number = 1;
  },
  'is run in isolation from other batches': function () {
    assert.strictEqual(this.number, 1);
  },
  'Another context': function () {
    this.number = 2;
  },
  'is isolated from the first context': function () {
    assert.strictEqual(this.number, 2);
  },

  // Another kitchen sink test
  'Multiple levels of nested expansion': ['Multiple levels', 'nested expansion'],
  'Multiple levels': ['Multiple', 'levels'],
  'nested expansion': ['nested', 'expando'],
  'Multiple': function () {
    this.nestedNumber = 1;
  },
  'levels': function () {
    this.nestedNumber += 2;
  },
  'nested': ['nested2'],
  'nested2': 'nested3',
  'nested3': [function () {
    this.nestedNumber += 3;
  }],
  'expando': function () {
    this.nestedNumber += 4;
  },
  'are supported': function () {
    assert.strictEqual(this.nestedNumber, 10);
  },

  // More kitchen sink test
  'One more context': function () {
    this.chainedContext = [1, 2, 3];
  },
  'is preserved during chaining': ['chained assert'],
  'chained assert': function () {
    assert.deepEqual(this.chainedContext, [1, 2, 3]);
  },

  // Another kitchen sync test
  'Running a sync -> async -> sync context': ['sync', 'async', 'sync2'],
  'sync': function () {
    this.asyncSum = 1;
  },
  'async': function (done) {
    var that = this;
    setTimeout(function () {
      that.asyncSum += 2;
      done();
    }, 100);
  },
  'sync2': function () {
    this.asyncSum *= 2;
  },
  'has the contexts run in order': function () {
    assert.strictEqual(this.asyncSum, 6);
  }
};