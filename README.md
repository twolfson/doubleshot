# doubleshot

Separate BDD outline from content but run it in Mocha.

Doubleshot serves the single purpose of separating BDD outlines from their implementation. The benefits I will highlight are chaining and re-use of tests.

There are additional benefits such as re-using outlines between different frameworks however an ecosystem is missing for that.

This concept has been birthed out of my previous attempts to achieve a cross-framework testing solution (i.e. [sculptor][sculptor] and [crossbones][crossbones]).

[sculptor]: https://github.com/twolfson/sculptor
[crossbones]: https://github.com/Ensighten/crossbones

## Getting Started
Install the module globally via: `npm install -g doubleshot`

```javascript
var doubleshot = require('doubleshot');
doubleshot.awesome(); // "awesome"
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint your code using [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Todd Wolfson
Licensed under the MIT license.
