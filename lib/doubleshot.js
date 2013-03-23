// TODO: Move these into bin
// TODO: Probably want nopt for this due to `remain` functionality
// TODO: CLI should read `doubleshot`
// TODO: CLI should read `doubleshot test`
// TODO: CLI should read `doubleshot --outline test/outline --content test/content`

// TODO: Load in files
// TODO: Use glob against pattern passed in
var outlineFiles = [__dirname + '/../test/doubleshot_outline'],
    contentFiles = [__dirname + '/../test/doubleshot_content'],
    outlineArr = outlineFiles.map(require),
    contentArr = contentFiles.map(require);

// // TODO: This could be broken into module -- probably sculptor but not... bury that hatchet =X
// TODO: Probably call it grafter -- combining skin onto bones
// or sketch artist or author or writer or shakespeare or essay or grad student
// grafter is probably best
// // TODO: Process
function Barista() {
  this.commands = {};
}
Barista.prototype = {
  addCommand: function (name, fn) {
    this.commands[name] = fn;
  },
  addCommands: function (commandObj) {
    var commandKeys = Object.getOwnPropertyNames(commandObj);

  },
  processBatch: function () {

  }
};
var barista = new Barista();
barista.addCommands(outlineArr[0]);

var assert = require('assert'),
    batches = [{
      'One': {
        'before': function () {
          this.one = 1;
        },
        'is equal to one': function () {
          assert.strictEqual(this.one, 1);
        }
      }
    }];

// Recursively render batches
function render(batch) {
  // If there is a beforeFn, run it as `before`
  var beforeFn = batch.before;
  if (beforeFn) {
    before(beforeFn);
    delete batch.before;
  }

  // Iterate and recurse over each part
  // TODO: This fucks with order -- use `for in` + closure instead
  // The closure is necessary for subbatch since `describe` can be async
  var contexts = Object.getOwnPropertyNames(batch);
  contexts.forEach(function recursivelyRender (context) {
    var subbatch = batch[context];

    // If the subbatch is an object, continue diving
    if (typeof subbatch === 'object') {
      describe(context, function execRecursiveRender () {
        return render.call(this, subbatch);
      });
    } else {
    // Otherwise, execute `it`
      it(context, subbatch);
    }
  });
}

// DEV: We cannot render the interpretted content to a file as items
// not included in the module.exports (e.g. require('abc')) will be lost

// Overload loadFiles to use our rendered files
var Mocha = require('mocha'),
    path = require('path');
Mocha.prototype.loadFiles = function (fn) {
  var self = this;
  var suite = this.suite;
  batches.forEach(function(batch, i){
    file = path.resolve(outlineFiles[i]);
    suite.emit('pre-require', global, file, self);
    suite.emit('require', render(batch), file, self);
    suite.emit('post-require', global, file, self);
  });
  if (fn) { fn(); }
};

// Load in mocha's binary file
require('mocha/bin/_mocha');