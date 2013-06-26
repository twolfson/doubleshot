module.exports = {
  'Two slow hooks': ['slow', 'slow'],
  'slow': function (done) {
    setTimeout(done, 1500);
  },
  'two slow assertions and a quick one': ['slow', 'slow', 'quick'],
  'quick': function () {
    console.log('Reached assertion');
  }
};