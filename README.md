# metalsmith-babel

[![npm version](https://img.shields.io/npm/v/metalsmith-babel.svg)](https://www.npmjs.com/package/metalsmith-babel)
[![Build Status](https://travis-ci.org/babel/metalsmith-babel.svg?branch=master)](https://travis-ci.org/babel/metalsmith-babel)
[![Coverage Status](https://img.shields.io/coveralls/babel/metalsmith-babel.svg)](https://coveralls.io/github/babel/metalsmith-babel)

[Babel](https://babeljs.io/) plugin for [Metalsmith](https://github.com/segmentio/metalsmith)

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/about-npm/):

```
npm install metalsmith-babel
```

And ensure the requisite [Babel plugins](https://babeljs.io/docs/plugins) are installed.

## Usage

### [CLI](https://github.com/metalsmith/metalsmith#cli)

Add the `metalsmith-babel` field to your `metalsmith.json`.

```javascript
{
  "plugins": {
    "metalsmith-babel": {
      "presets": ["@babel/preset-env"]
    }
  }
}
```

### [API](https://github.com/metalsmith/metalsmith#api)

```javascript
const Metalsmith = require('metalsmith');
const babel = require('metalsmith-babel');

const babelOptions = {
  presets: ['env']
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

All `@babel/core` [options](https://babeljs.io/docs/en/babel-core#options) are available except for `filename` and `filenameRelative` that will be automatically set.

## License

[ISC License](./LICENSE) © 2017 - 2018 Shinnosuke Watanabe
