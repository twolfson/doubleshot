module.exports = {
  'One': function () {
    this.sum = 1;
  },
  'plus one': function () {
    this.sum += 1;
  },
  // DEV: This is for you grammar people
  'equals too': function () {
    if (this.sum !== 2) {
      throw new Error(this.sum + ' !== 2');
    }
  }
};