module.exports = {
  before: function () {
    console.log('global beforeAll');
  },
  beforeEach: function () {
    console.log('global beforeEach');
  },
  afterEach: function () {
    console.log('global afterEach');
  },
  after: function () {
    console.log('global afterAll');
  },
  'One': {
    before: function () {
      this.sum = 1;
      console.log('beforeAll1');
    },
    beforeEach: function () {
      console.log('beforeEach1');
    },
    afterEach: function () {
      console.log('afterEach1');
    },
    after: function () {
      console.log('afterAll1');
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