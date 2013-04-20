// Outline
{
  'doubleshot': {
    'reads the `test` directory implicitly': true,
    'allows for usage of `mocha` options': true,
    'allows for explicit directory specification': true,
    'allows for explicity file (and pattern) matching': true
  }
}


// ./bin/doubleshot
// ./bin/doubleshot --reporter nyan
// ./bin/doubleshot test
// ./bin/doubleshot --outline test/doubleshot_outline.json --content test/doubleshot_content.js --reporter nyan