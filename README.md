# doubleshot [![Build status](https://travis-ci.org/twolfson/doubleshot.png?branch=master)](https://travis-ci.org/twolfson/doubleshot)

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

// test/outline.yaml
One:
  - is equal to one

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
`doubleshot` is run via the command line. By default, it attempts to find content and outline files in the `test` directory. As long as the file name ends with either `outline` or `content`, they will be found.

```js
// Common outline filenames
test/outline.yaml
test/my_lib_outline.js
test/basic_tests_outline.json

// Common content filenames
test/content.js
test/my_lib_content.js
test/basic_tests_outline.js
```

Alternatively, you can specify a [minimatch][minimatch] pattern to find them via `--outline` and `--content` options on the command line. By default, the [minimatch][minimatch] patterns are:

```shell
test/*outline.{js,json,yaml} OR test/outline/{{name}}.{js,json,yaml}
test/*content.js OR test/content/{{name}}.js
```

[minimatch]: https://github.com/isaacs/minimatch

### Outline format
Outlines can be either in `js`, [JSON][json], or [YAML][yaml]. For simplicity's sake, the majority of examples will use [YAML][yaml].

[json]: http://www.json.org/
[yaml]: http://www.yaml.org/spec/1.2/spec.html#id2759963

Any new context (i.e. `describe` in `mocha`) is an object followed by an array. This array can either contain assertions or more contexts. The array is required for ensure that actions are run in order.

Any assertion (i.e. `it` in `mocha`) is a string.

The following outline:

```yaml
# 'A banana' performs a `describe`
A banana:
  # 'is yellow' and 'has a peel' perform `it`s
  - is yellow
  - has a peel
  - when peeled:
    - is white
    - is soft
```

compiles to:

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

#### Using `JSON` for outlines
Initially, `doubleshot` was developed with inspiration from [vows][vows]. However, the [JSON][json] format was unordered we required to move to an ordered JSON format. This was taken from [YAML][yaml].

[vows]: http://vowsjs.org/

The format of the [JSON][json] is the same as the [YAML][yaml]; each context is a new object containing an array of either more contexts or assertions.

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

### Content format
Content does not distinguish `context` from `assertion` since in `mocha` they have the same signature. To aim for the simplest format possible, we collect them in a large object.

The keys represent the name of the `context`/`assertion` you used in the `outline`.

If the `key` is for a `context`, the `function` will be run in a `before` block.

If the `key` is for an `assertion`, the `function` will be run in an `it` block.

The following code:

```js
{
  'A banana': function () {
    var banana = new Banana();
  },
  'is yellow': function () {
    assert.strictEqual(banana.color, 'yellow');
  }
}
```

compiles to:

```js
describe('A banana', function () {
  before(function () {
    var banana = new Banana();
  });

  it('is yellow', function () {
    assert.strictEqual(banana.color, 'yellow');
  });
});
```

### Context; using `this`
`mocha` allows for the usage of `this` as a shared store between all contexts and assertions.

This means, if you define a property on `this` in a `before` block, you can read it in the `it` block.

In `doubleshot`, this is strongly encouraged to prevent global namespace pollution (i.e. writing to `window` or `global` to share variables) or scope leaks (i.e. writing to a `var` outside of the current function).

Here is a usage in `mocha`:

```js
describe('A banana', function () {
  before(function () {
    // Save this banana to the test context
    this.banana = new Banana();
  });

  it('is yellow', function () {
    // Retrieve the banana from the test context
    var banana = this.banana;

    // Test against the banana
    assert.strictEqual(banana.color, 'yellow');
  });
});
```

Here is that same usage in `doubleshot`:

```js
{
  'A banana': function () {
    // Save this banana to the test context
    this.banana = new Banana();
  },
  'is yellow': function () {
    // Retrieve the banana from the test context
    var banana = this.banana;

    // Test against the banana
    assert.strictEqual(banana.color, 'yellow');
  }
}
```

### Combining outline and content
The combination process in `doubleshot` is string matching. If a `key` in `outline` matches a `key` in `content`, then the `value` from `content` is assigned to that from `outline`.

If you have any keys in one set that are not matched to another, `doubleshot` will let you know via a `console.error` message.

When we combine this outline:

```yaml
A banana:
  - is yellow
  - has a peel
```

and this content:

```js
{
  'A banana': function () {
    this.banana = new Banana();
  },
  'is yellow': function () {
    assert.strictEqual(this.banana.color, 'yellow');
  }
  'has a peel': function () {
    assert(this.banana.peel);
  }
}
```

They match along the `A banana`, `is yellow`, and `has a peel` keys, returning:

```js
describe('A banana', function () {
  before(function () {
    this.banana = new Banana();
  });

  it('is yellow', function () {
    assert.strictEqual(this.banana.color, 'yellow');
  });

  it('has a peel', function () {
    assert(this.banana.peel);
  });
});
```

### Hooks
The normal `mocha` hooks (e.g. `after`, `beforeEach`, `afterEach`) are available on the global level and per-context level.

If you provide an object instead of a function, you can define the hooks individually by name.

```js
{
  'A banana': {
    before: function () {
      // Runs before *all* contexts and assertions
      this.banana = new Banana();
    },
    beforeEach: function () {
      // Runs before *each* context and assertion
    },
    afterEach: function () {
      // Runs after *each* context and assertion
    },
    after: function () {
      // Runs after *all* contexts and assertions
    }
  }
}
```

For global hooks, define them directly on the `content`.

```js
{
  before: function () {
    // Runs before *all* batches
  },
  beforeEach: function () {
    // Runs before *each* batch
  },
  afterEach: function () {
    // Runs after *each* batch
  },
  after: function () {
    // Runs after *all* batches
  },
  'A banana': {
    this.banana = new Banana();
  }
}
```

### Aliasing and expansion
One of the bonus features of `doubleshot` is aliasing and expansion.

#### Aliasing
Any key you define inside of `content` can be the name of another `content` property (e.g. `"1"` can point to `"One"`).

If an alias is not found, you will be notified via a `console.error` message.

#### Expansion
Any key you define inside of `content` can be an array of names of other `content` properties (e.g. `"1 + 2"` can point to `"One"` and `"plus two"`, which are run in order).

You can also define a function inline in your expansion (e.g. `"1 + 2" -> `["One", function () { /* plus two */ }]`)

#### Unlimited depth and chaining
You can infinitely chain aliases and expansions (e.g. `"1 + 2"` -> `["1", "+ 2"]` -> `["One", "plus two"]` -> `["Zero", "plus one", "plus one", "plus one"]`). In code, that would look like:

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
Here is a full example of using expansion and aliasing:

```js
// outline.yaml
'1 + 2': ['= 3']

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
describe('1 + 2', function () {
  before(function () {
    // These are contained inside functions but have the same effect
    this.sum = 1;
    this.sum += 2;
  });

  it('= 3', function () {
    assert.strictEqual(this.sum, 3);
  });
});
```

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint your code using [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
