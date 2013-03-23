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

// TODO: We are going to encounter the serialize function to file problem soon.
// TODO: Hack through it first -- overload `require` to use our special UUID paths

// TODO: Write out to tmp files -- use tmpfile for this

// TODO: We might want to do the same `spawn` that mocha does itself
// Otherwise, we will be updating argv/argc by hand
// TODO: Load in mocha/bin/mocha and point to our test files