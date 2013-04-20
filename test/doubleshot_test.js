// Load in child_process and chai
var cp = require('child_process'),
    exec = cp.exec,
    chai = require('chai'),
    expect = chai.expect;

// Outline
var outline = {
  'doubleshot': {
    'reads the `test` directory implicitly': true,
    'allows for usage of `mocha` options': true,
    'allows for explicit directory specification': true,
    'allows for explicity file (and pattern) matching': true
  }
};

// Content
var doubleshot = __dirname + '/../bin/doubleshot';
describe('doubleshot', function () {
  it('reads the `test` directory implicitly', function (done) {
    // Run doubleshot implicitly
    exec(doubleshot, function handleDblImplicit (err, stdout, stderr) {
      // If there is an error or stderr, callback with it
      err = err || stderr;
      if (err) {
        done(err);
      } else {
      // Otherwise, assert the test suite ran successfully
        expect(stdout).to.contain('complete');
        expect(stdout).to.not.contain('pending');
        expect(stdout).to.not.contain('failed');

        // and callback
        done();
      }
    });
  });

  it('allows for usage of `mocha` options', function (done) {
    '( ^ .^)'; // Success face
    // '( - .-)'; // Pending face
    // '( o .o)'; // Fail face
    done();
  });

  it('b', '');
  // it('c', function () { throw new Error('=('); });
});

// ./bin/doubleshot --reporter nyan
// ./bin/doubleshot test
// ./bin/doubleshot --outline test/doubleshot_outline.json --content test/doubleshot_content.js --reporter nyan