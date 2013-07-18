# doubleshot changelog
2.10.0 - Cleaned up `doubleshot.loadFiles` by breaking it down.

2.9.0 - Added support for aliasing and chaining local object hooks. Fixed #30.

2.8.0 - Added support for aliasing and chaining global hooks. Fixed #29.

2.7.0 - Added back batch isolation repairing with a test against the case in issue #35

2.6.1 - Moved isolated batch test to pending status

2.6.0 - Removing per-batch context cleaning since issue #35 was reported

2.5.0 - Added support for local and global `after`, `beforeEach`, `afterEach` hooks

2.4.0 - Upgraded to `object-fusion2@0.2.0` for better validation against input data

2.3.0 - Added isolation between batches to enforce module pattern between tests

2.2.1 - Added test against `YAML` and updated documentation to use `YAML` over `JSON`

2.2.0 - Simplified default file search, added dynamic extension to file search and `watch`, and added `YAML` support by default.

2.1.0 - Repaired broken `watch` and updated `addOutline`, `addContent`, `loadFiles`, and `run` to lazy load files.

2.0.0 - Released new JSON format which forces ordering in `outline`

Before 2.0.0 - See `git log`