var assert = require('assert');
module.exports = {
  'A test': function () {
    this.one = 1;
  },
  'can be run': function () {
    assert(this.one, 1);
  }
};