# doubleshot

Run separated BDD outlines and content on Mocha.

Doubleshot serves the single purpose of separating BDD outlines from their implementation. The benefits I will highlight are chaining and re-use of tests.

There are additional benefits such as re-using outlines between different frameworks however an ecosystem is missing for that.

This concept has been birthed out of my previous attempts to achieve a cross-framework testing solution (i.e. [sculptor][sculptor] and [crossbones][crossbones]).

[sculptor]: https://github.com/twolfson/sculptor
[crossbones]: https://github.com/Ensighten/crossbones

## Getting Started
doubleshot is a global module and is run on the command line

```shell
npm install -g doubleshot # Installs doubleshot globally
doubleshot # Runs content/outline files in test folder
```

## Documentation
`doubleshot` is run via the command line. By default, it attempts to find content and outline files in the `test` directory. They should match the following format.

```shell
test/{{name}}_outline.json OR test/outline/{{name}}.json
test/{{name}}_content.js OR test/content/{{name}}.js
Accepted file extensions are: `js`, `json`, `node`
```

Alternatively, you can specify a pattern to find them.

```shell
doubleshot --help

Run separated BDD outlines and content on Mocha.
Usage: node ./bin/doubleshot [test dir] [--options]

Options:
  --outline  Path to outline files (minimatch accepted)
  --content  Path to content files (minimatch accepted)
  --help     You are reading it                          [boolean]
```

There is an underlying library, however, it currently cannot be used in isolation.

## Examples
### Basic
```js
// outline.json
{
  "One": {
    "is equal to one": true
  }
};

// content.js
{
  'One': function () {
    this.one = 1;
  },
  'is equal to one': function () {
    assert.strictEqual(this.one, 1);
  }
}

// Runs test as
describe('One', function () {
  before(function () {
    this.one = 1;
  });

  it('is equal to one', function () {
    assert.strictEqual(this.one, 1);
  });
});
```

### Advanced (aliasing and expansion)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint your code using [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
