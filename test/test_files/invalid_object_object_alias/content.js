module.exports = {
  'One': {
    before: '1'
  },
  '1': {
    before: function () {
      this.sum = 1;
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