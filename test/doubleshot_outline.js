module.exports = [{
// Basic tests
  "A test": ["can be run"]
}, {
// Intermediate tests
  "A test": [{
    "using aliasing": ["runs"]
  }]
}, {
  "A test using expansion": [
    "can run properly"
  ]
}, {
  "A test using async expansion": [
    "still completes"
  ]
}, {
// Kitchen sink tests
  "One context": [
    "is run in isolation from other batches"
  ]
}, {
  "Another context": [
    "is isolated from the first context"
  ]
}, {
// Another kitchen sink test
  "Multiple levels of nested expansion": [
    "are supported"
  ]
}, {
// More kitchen sink test
  "One more context": [
    "is preserved during chaining"
  ]
}, {
// Kitchen sync test regarding async behavior
  'Running a sync -> async -> sync context': [
    'has the contexts run in order'
  ]
}];