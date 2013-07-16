module.exports = {
  before: [function () {
    console.log('global beforeAll1');
  }, 'alias1'],
  'alias1': 'alias2',
  'alias2': function () {
    console.log('global beforeAll2');
  },
  'One': function () {
    this.sum = 1;
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