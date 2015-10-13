# metalsmith-babel

[![NPM version](https://img.shields.io/npm/v/metalsmith-babel.svg)](https://www.npmjs.com/package/metalsmith-babel)
[![Build Status](https://travis-ci.org/babel/metalsmith-babel.svg?branch=master)](https://travis-ci.org/babel/metalsmith-babel)
[![Build status](https://ci.appveyor.com/api/projects/status/k49tibi2lsbl0xk2?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/metalsmith-babel)
[![Coverage Status](https://img.shields.io/coveralls/babel/metalsmith-babel.svg)](https://coveralls.io/r/babel/metalsmith-babel)
[![Dependency Status](https://img.shields.io/david/babel/metalsmith-babel.svg?label=deps)](https://david-dm.org/babel/metalsmith-babel)
[![devDependency Status](https://img.shields.io/david/dev/babel/metalsmith-babel.svg?label=devDeps)](https://david-dm.org/babel/metalsmith-babel#info=devDependencies)

[Babel](https://babeljs.io/) plugin for [Metalsmith](http://www.metalsmith.io/)

## Installation

[Use npm](https://docs.npmjs.com/cli/install):

```
npm install metalsmith-babel
```

And ensure the requisite [Babel plugins](https://babeljs.io/docs/plugins/) are installed.

## Usage

### [CLI](https://github.com/segmentio/metalsmith#cli)

Add the `metalsmith-babel` field to your `metalsmith.json`.

```javascript
{
  "plugins": {
    "metalsmith-babel": {
      "presets": [
        "es2015"
      ]
      "modules": "common",
      "comments": true
    }
  }
}
```

### [API](https://github.com/segmentio/metalsmith#api)

```javascript
const Metalsmith = require('metalsmith');
const babel = require('metalsmith-babel');

const babelOptions = {
  presets: ['es2015']
};

new Metalsmith('./source')
.use(babel(babelOptions))
.build((err, files) => {
  if (err) {
    throw err;
  }

  console.log('Completed.');
});
```

### Options

All [Babel options](https://babeljs.io/docs/usage/options/) are available except for `filename` and `filenameRelative` that will be automatically set.

## License

Copyright (c) 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
