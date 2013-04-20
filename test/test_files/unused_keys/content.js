module.exports = {
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
  },
  'equals three': function () {
    if (this.sum !== 3) {
      throw new Error(this.sum + ' !== 3');
    }
  }
};