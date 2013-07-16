module.exports = {
  'One': function () {
    this.sum = 1;
  },
  'plus one': function () {
    this.sum += 1;
  },
  'equals two': 'equals too',
  'equals 2': function () {
    if (this.sum !== 2) {
      throw new Error(this.sum + ' !== 2');
    }
  }
};