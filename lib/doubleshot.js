// TODO: Move these into bin
// TODO: Probably want nopt for this due to `remain` functionality
// TODO: CLI should read `doubleshot`
// TODO: CLI should read `doubleshot test`
// TODO: CLI should read `doubleshot --outline test/outline --content test/content`

// TODO: Load in files
// TODO: Use glob against pattern passed in
var outlineFiles = [require('../test/doubleshot_outline')],
    contentFiles = [require('../test/doubleshot_content')];

// // TODO: This could be broken into module -- probably sculptor but not... bury that hatchet =X
// // TODO: Process
// var barista = require('./barista'),

// Start with an export =D
var rendered = function () {
  var assert = require('assert');
  describe('One', function () {
    before(function () {
      this.one = 1;
    });

    it('is equal to one', function () {
      assert(this.one, 1);
    });
  });
};

// Overload loadFiles to use our rendered files
var Mocha = require('mocha'),
    path = require('path');
Mocha.prototype.loadFiles = function (fn) {
  var self = this;
  var suite = this.suite;
  var pending = this.files.length;
  this.files.forEach(function(file, i){
    file = path.resolve(file);
    suite.emit('pre-require', global, file, self);
    suite.emit('require', rendered(), file, self);
    suite.emit('post-require', global, file, self);
    --pending || (fn && fn());
  });
};

// Load in mocha's binary file
require('mocha/bin/_mocha');