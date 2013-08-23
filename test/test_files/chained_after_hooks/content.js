module.exports = {
  'One': [{
    before: function () {
      this.sum = 1;
    },
    after: function () {
      console.log('chainedAfter afterAll1');
    }
  }, {
    after: function () {
      console.log('chainedAfter afterAll2');
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