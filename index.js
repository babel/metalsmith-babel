/*!
 * metalsmith-babel | MIT (c) Shinnosuke Watanabe
 * https://github.com/babel/metalsmith-babel
*/
'use strict';

const path = require('path');

const babel = require('babel-core');

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
        files[file + '.map'] = {
          mode: files[file].mode,
          contents: new Buffer(JSON.stringify(result.map))
        };

        result.code += `\n//# sourceMappingURL=${file}.map\n`;
      }

      files[file].contents = new Buffer(result.code);
    });
    done();
  };
};
