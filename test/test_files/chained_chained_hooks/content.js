module.exports = {
  'One': [{
    before: function () {
      this.sum = 1;
    },
    after:  [function () {
      console.log('chainedChained afterAll1');
    }]
  }, 'chain1'],
  'chain1': ['chain2'],
  'chain2': {
    after:  [function () {
      console.log('chainedChained afterAll2');
    }]
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