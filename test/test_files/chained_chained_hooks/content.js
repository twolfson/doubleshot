module.exports = {
  'One': [{
    before: function () {
      this.sum = 1;
    },
    after:  [function () {
      console.log('local afterAll1');
    }, 'alias1']
  }, 'chain1', 'alias3'],
  'chain1': ['chain2'],
  'chain2': {
    after:  [function () {
      console.log('local afterAll3');
    }]
  },
  'alias1': 'alias2',
  'alias2': function () {
    console.log('local afterAll2');
  },
  'alias3': function () {
    console.log('local afterAll4');
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