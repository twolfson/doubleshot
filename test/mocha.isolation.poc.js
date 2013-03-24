var assert = require('assert');

describe('An isolated test', function () {
  before(function () {
    this.isolationA = true;
  });

  it('can be run', function () {
  });
});

describe('Another isolated test', function () {
  it('is isolated from its peers', function () {
    assert.notEqual(this.isolationA, true);
  });
});