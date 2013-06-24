# doubleshot

Run separated BDD outlines and content on top of [mocha][mocha].

`doubleshot` serves the single purpose of separating BDD outlines from their implementation. The benefits I will highlight are chaining and re-use of tests.

There are additional benefits such as re-using outlines between different frameworks however an ecosystem is missing for that.

This concept has been birthed out of my previous attempts to achieve a cross-framework testing solution (i.e. [sculptor][sculptor] and [crossbones][crossbones]).

[mocha]: https://github.com/visionmedia/mocha/
[sculptor]: https://github.com/twolfson/sculptor
[crossbones]: https://github.com/Ensighten/crossbones

## Getting Started
`doubleshot` is a global module and is run on the command line

```shell
npm install -g doubleshot # Installs doubleshot globally
doubleshot # Runs content/outline files in test folder

// test/outline.json
{
  "One": ["is equal to one"]
};

// test/content.js
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

// Output looks like
$ doubleshot --reporter spec

  One
    ✓ is equal to one
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

### Outline format
In `doubleshot<=2.0.0`, there was an issue with the context ordering. The latest format is the thinnest but is running away from its [vows][vows] roots.

[vows]: http://vowsjs.org/

Any new context (i.e. `describe` in `mocha`) is an object followed by an array. This array can either contain assertions or more contexts. The array is required for ensure that actions are run in order.

Any assertion (i.e. `it` in `mocha`) is a string.

The following outline

```js
{
  // 'A banana' performs a `describe`
  'A banana': [
    // 'is yellow' and 'has a peel' perform `it`s
    'is yellow',
    'has a peel',
    {
      'when peeled': [
        'is white',
        'is soft'
      ]
    }
  ]
}
```

compiles to

```js
describe('A banana', function () {
  it('is yellow', contentGoesHere);
  it('has a peel', contentGoesHere);

  describe('when peeled', function () {
    it('is white', contentGoesHere);
    it('is soft', contentGoesHere);
  });
});
```

### Content format
TODO: One big object

### Context
TODO: Explain `this` usage

### Combining outline and content
TODO: Explain keys matching

### Aliasing and expansion
One of the bonus features of `doubleshot` is aliasing and expansion.

#### Aliasing
Any key you define inside of `content` can be the name of another `content` property (e.g. `"1"` can point to `"One"`).

#### Expansion
Any key you define inside of `content` can be an array of names of other `content` properties (e.g. `"1 + 2"` can point to `"One"` and `"plus two"`, which are run in order).

#### Unlimited depth and chaining
You can infinitely chain aliases and expansions (e.g. `"1 + 2"` -> `["1", "+ 2"]` -> `["One", "plus two"]` -> `["Zero", "plus one", "plus one", "plus one"]`). In code, that would look like

```js
// content.js
{
  "1 + 2": ["1", "+ 2"],
  "1": "One",
  "One": ["Zero", "plus one"],
  "+ 2": "plus two",
  "plus two": ["plus one", "plus one"],
  "Zero": function () {
    this.sum = 0;
  },
  "plus one": function () {
    this.sum = 1;
  }
}
```

## Examples
Below is an example of using expansion and aliasing.


```js
// outline.json
{
  "1 + 2": ["=3"]
}

// content.js
{
  // Breaks 'One plus two' action into 2 actions
  '1 + 2': ['One', 'plus two'],
  'One': function () {
    this.sum = 1;
  },
  'plus two': function () {
    this.sum += 2;
  },
  // Alias 'is equal to three' as 'equals three'
  '= 3': 'equals three',
  'equals three': function () {
    assert.strictEqual(this.sum, 3);
  }
}

// Runs test as
describe('One plus two', function () {
  before(function () {
    // These are contained inside functions but have the same effect
    this.sum = 1;
    this.sum += 2;
  });

  it('is equal to three', function () {
    assert.strictEqual(this.sum, 3);
  });
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint your code using [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
