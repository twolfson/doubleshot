module.exports = {
  before: function () {
    console.log('global before');
  },
  beforeEach: function () {
    console.log('global beforeEach');
  },
  after: function () {
    console.log('global after');
  },
  afterEach: function () {
    console.log('global afterEach');
  },
  'One': {
    before: function () {
      this.sum = 1;
      console.log('before1');
    },
    beforeEach: function () {
      this.sum = 1;
      console.log('beforeEach1');
    },
    after: function () {
      console.log('after1');
    },
    afterEach: function () {
      console.log('afterEach1');
    }
  },
  'plus one': function () {
    this.sum += 1;
  },
  'equals two': function () {
    if (this.sum !== 2) {
      throw new Error(this.sum + ' !== 2');
    }
  }
};