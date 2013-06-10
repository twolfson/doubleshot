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
    'warns user when keys are not found': true,
    'can be run against a folder not labelled `test` and options exclusively': true
  }
};

// Handle stderr throwbacks
function cleanStdErr(stdout, stderr, cb) {
  // If there were any errors, callback with them
  console.log(stdout);
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
// Basic tests
var path = require('path'),
    doubleshot = 'node ' + path.resolve(__dirname, '../bin/doubleshot');
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

//   it('allows for usage of `mocha` options', function (done) {
//     async.waterfall([
//       // Run doubleshot with mocha options
//       function runDblMochaOptions (cb) {
//         var cmd = doubleshot + ' --reporter nyan';
//         exec(cmd, cb);
//       },
//       // Clean up and errors from stderr
//       cleanStdErr,
//       // Assert the test suite ran successfully
//       assertNyanSuccess
//     ], done);
//   });

//   it('allows for explicit directory specification', function (done) {
//     async.waterfall([
//       // Run doubleshot with mocha options
//       function runDblMochaOptions (cb) {
//         var cmd = doubleshot + ' test';
//         exec(cmd, cb);
//       },
//       // Clean up and errors from stderr
//       cleanStdErr,
//       // Assert the test suite ran successfully
//       assertDotSuccess
//     ], done);
//   });

//   it('allows for explicity file (and pattern) matching alongside mocha options', function (done) {
//     async.waterfall([
//       // Run doubleshot with mocha options
//       function runDblMochaOptions (cb) {
//         var cmd = doubleshot + ' --outline test/doubleshot_outline.js --content test/doubleshot_content.js --reporter nyan';
//         exec(cmd, cb);
//       },
//       // Clean up and errors from stderr
//       cleanStdErr,
//       // Assert the test suite ran successfully
//       assertNyanSuccess
//     ], done);
//   });
// });

// describe('doubleshot', function () {
//   it('warns user when keys are unused', function (done) {
//     // Run doubleshot against unused keys files
//     var cmd = doubleshot + ' --content test/test_files/unused_keys/content.js --outline test/test_files/unused_keys/outline.json';
//     exec(cmd, function handleDblUnusedKeys (err, stdout, stderr) {
//       // If there is an error, callback
//       if (err) { return done(err); }

//       // Assert stderr contains info about failing items
//       expect(stderr).to.contain('equals three');
//       expect(stderr).to.contain('not used');

//       // Callback
//       done();
//     });
//   });

//   it('warns user when keys are not found', function (done) {
//     // Run doubleshot against unused keys files
//     var cmd = doubleshot + ' --content test/test_files/keys_not_found/content.js --outline test/test_files/keys_not_found/outline.json';
//     exec(cmd, function handleDblKeysNotFound (err, stdout, stderr) {
//       // If there is an error, callback
//       if (err) { return done(err); }

//       // Assert stderr contains info about failing items
//       expect(stderr).to.contain('equals two');
//       expect(stderr).to.match(/not .* found/);

//       // Callback
//       done();
//     });
//   });

//   it('can be run against a folder not labelled `test` and options exclusively', function (done) {
//     // Move to the current directory for execution
//     var cwd = process.cwd();
//     process.chdir(__dirname + '/test_files');

//     // Run doubleshot against spec folder
//     var cmd = doubleshot + ' --content spec/content.js --outline spec/outline.json';
//     exec(cmd, function handleDblKeysNotFound (err, stdout, stderr) {
//       // If there is an error, callback
//       if (err) { return done(err); }

//       // Assert stderr is empty
//       expect(stderr).to.equal('');

//       // Go back to original directory
//       process.chdir(cwd);

//       // Callback
//       done();
//     });
//   });
});