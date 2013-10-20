module.exports = {
  'One': function () {
    this.sum = 1;
  },
  'plus one': function () {
    throw Error('No.');
  },
  'equals two': function () {
    if (this.sum !== 2) {
      throw new Error(this.sum + ' !== 2');
    }
  }
};