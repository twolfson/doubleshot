// Load in child_process and chai
var cp = require('child_process'),
    exec = cp.exec,
    async = require('async'),
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

// Handle stderr throwbacks
function cleanStdErr(stdout, stderr, cb) {
  // If there were any errors, callback with them
  if (stderr) {
    var err = new Error(stderr);
    cb(err);
  } else {
  // Otherwise, callback with stdout
    cb(null, stdout);
  }
}

// Content
var doubleshot = __dirname + '/../bin/doubleshot';
describe('doubleshot', function () {
  it('reads the `test` directory implicitly', function (done) {
    async.waterfall([
      // Run doubleshot implicitly
      function runDblImplicitly (cb) {
        exec(doubleshot, cb);
      },
      // Clean up and errors from stderr
      cleanStdErr,
      // Assert the test suite ran successfully
      function assertDblImplicit (stdout, cb) {
        expect(stdout).to.contain('complete');
        expect(stdout).to.not.contain('pending');
        expect(stdout).to.not.contain('failed');
        cb();
      }
    ], done);
  });

  it('allows for usage of `mocha` options', function (done) {
    async.waterfall([
      // Run doubleshot with mocha options
      function runDblMochaOptions (cb) {
        var cmd = doubleshot + ' --reporter nyan';
        exec(cmd, cb);
      },
      // Clean up and errors from stderr
      cleanStdErr,
      // Assert the test suite ran successfully
      function assertDblMochaOptions (stdout, cb) {
        expect(stdout).to.contain('( ^ .^)');
        // '( ^ .^)'; // Success face
        // '( - .-)'; // Pending face
        // '( o .o)'; // Fail face
        cb();
      }
    ], done);
  });

  // it('b', '');
  // it('c', function () { throw new Error('=('); });
});

// ./bin/doubleshot --reporter nyan
// ./bin/doubleshot test
// ./bin/doubleshot --outline test/doubleshot_outline.json --content test/doubleshot_content.js --reporter nyan