module.exports = [{
// Basic tests
  "A test": {
    "can be run": true
  }
}, {
// Intermediate tests
  "A test": {
    "using aliasing": {
      "runs": true
    }
  }
}, {
  "A test using expansion": {
    "can run properly": true
  }
}, {
  "A test using async expansion": {
    "still completes": true
  }
}, {
// Kitchen sink tests
  "One context": {
    "is run in isolation from other batches": true
  }
}, {
  "Another context": {
    "is isolated from the first context": true
  }
}];