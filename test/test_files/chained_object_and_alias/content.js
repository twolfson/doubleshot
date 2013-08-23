module.exports = {
  'One': [{
    before: function () {
      this.sum = 1;
    },
    after:  [function () {
      console.log('chainedObjectAlias afterAll1');
    }]
  }, 'alias1'],
  'alias1': function () {
    console.log('chainedObjectAlias beforeAll1');
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