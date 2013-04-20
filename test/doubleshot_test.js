// Load in child_process and chai
var cp = require('child_process'),
    exec = cp.exec,
    async = require('async'),
    chai = require('chai'),
    expect = chai.expect;

// Outline
// Basic tests
var basicTests = {
  'doubleshot': {
    'reads the `test` directory implicitly': true,
    'allows for usage of `mocha` options': true,
    'allows for explicit directory specification': true,
    'allows for explicity file (and pattern) matching alongside mocha options': true
  }
};

// Kitchen sink
var kitchenSink = {
  'doubleshot': {
    'warns user when keys are unused': true,
    'warns user when keys are not found': true
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

// Assertions for `dot` reporter
function assertDotSuccess(stdout, cb) {
  expect(stdout).to.contain('complete');
  expect(stdout).to.not.contain('pending');
  expect(stdout).to.not.contain('failed');
  cb();
}

// Assertions for `nyan` reporter
function assertNyanSuccess(stdout, cb) {
  expect(stdout).to.contain('( ^ .^)');
  // '( ^ .^)'; // Success face
  // '( - .-)'; // Pending face
  // '( o .o)'; // Fail face
  cb();
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
      assertDotSuccess
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
      assertNyanSuccess
    ], done);
  });

  it('allows for explicit directory specification', function (done) {
    async.waterfall([
      // Run doubleshot with mocha options
      function runDblMochaOptions (cb) {
        var cmd = doubleshot + ' test';
        exec(cmd, cb);
      },
      // Clean up and errors from stderr
      cleanStdErr,
      // Assert the test suite ran successfully
      assertDotSuccess
    ], done);
  });

  it('allows for explicity file (and pattern) matching alongside mocha options', function (done) {
    async.waterfall([
      // Run doubleshot with mocha options
      function runDblMochaOptions (cb) {
        var cmd = doubleshot + ' --outline test/doubleshot_outline.json --content test/doubleshot_content.js --reporter nyan';
        exec(cmd, cb);
      },
      // Clean up and errors from stderr
      cleanStdErr,
      // Assert the test suite ran successfully
      assertNyanSuccess
    ], done);
  });
});