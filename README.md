# metalsmith-6to5

[![NPM version](https://img.shields.io/npm/v/metalsmith-6to5.svg?style=flat)](https://www.npmjs.com/package/metalsmith-6to5)
[![Build Status](https://img.shields.io/travis/shinnn/metalsmith-6to5.svg?style=flat)](https://travis-ci.org/shinnn/metalsmith-6to5)
[![Build status](https://ci.appveyor.com/api/projects/status/3ddek6jbengs8ifx?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/metalsmith-6to5)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/metalsmith-6to5.svg?style=flat)](https://coveralls.io/r/shinnn/metalsmith-6to5)
[![Dependency Status](https://img.shields.io/david/shinnn/metalsmith-6to5.svg?style=flat&label=deps)](https://david-dm.org/shinnn/metalsmith-6to5)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/metalsmith-6to5/dev-status.svg?style=flat&label=devDeps)](https://david-dm.org/shinnn/metalsmith-6to5#info=devDependencies)

[6to5](https://6to5.org/) plugin for [Metalsmith](http://www.metalsmith.io/)

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install metalsmith-6to5
```

## Usage

### [CLI](https://github.com/segmentio/metalsmith#cli)

Add the `metalsmith-6to5` field to your `metalsmith.json`.

```javascript
{
  "plugins": {
    "metalsmith-markdown": {
      "modules": "common",
      "comments": true
    }
  }
}
```

### [API](https://github.com/segmentio/metalsmith#api)

```javascript
var Metalsmith = require('metalsmith');
var to5 = require('metalsmith-6to5');

new Metalsmith('./source')
.use(markdown({/* 6to5 options */}));
.build(function(err, files) {
  if (err) {
    throw err;
  }

  console.log('Completed.');
});
```

### Options

All [6to5 options](https://6to5.org/docs/usage/options/) are available except for `filename` and `filenameRelative` that will be automatically set.

## License

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[stream.Readable]: http://nodejs.org/api/stream.html#stream_class_stream_readable
