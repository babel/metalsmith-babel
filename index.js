/*!
 * metalsmith-babel | MIT (c) Shinnosuke Watanabe
 * https://github.com/babel/metalsmith-babel
*/
'use strict';

const path = require('path');

const babel = require('babel-core');
const slash = require('slash');

module.exports = function metalsmithBabel(options) {
  return function metalsmithBabelPlugin(files, metalsmith, done) {
    Object.keys(files).forEach(function metalsmithBabelfileIterator(file) {
      if (path.extname(file).toLowerCase() !== '.js') {
        return;
      }

      const result = babel.transform(String(files[file].contents), Object.assign({}, options, {
        filename: path.join(metalsmith._directory, metalsmith._source, file),
        filenameRelative: file
      }));

      if (result.map) {
        const sourcemapPath = file + '.map';
        files[sourcemapPath] = {
          mode: files[file].mode,
          contents: new Buffer(JSON.stringify(result.map))
        };

        result.code += `\n//# sourceMappingURL=${
          slash(path.relative(path.dirname(file), sourcemapPath))
        }\n`;
      }

      files[file].contents = new Buffer(result.code);
    });
    done();
  };
};
