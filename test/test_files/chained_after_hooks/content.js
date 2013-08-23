module.exports = {
  'One': [{
    before: function () {
      this.sum = 1;
    },
    after: function () {
      console.log('afterAll1');
    }
  }, {
    after: function () {
      console.log('afterAll2');
    }
  }],
  'plus one': function () {
    this.sum += 1;
  },
  'equals two': function () {
    if (this.sum !== 2) {
      throw new Error(this.sum + ' !== 2');
    }
  }
};