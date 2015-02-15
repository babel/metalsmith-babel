/*!
 * metalsmith-babel | MIT (c) Shinnosuke Watanabe
 * https://github.com/babel/metalsmith-babel
*/
'use strict';

var path = require('path');

var objectAssign = require('object-assign');
var babel = require('babel-core');

module.exports = function metalsmithBabel(options) {
  return function metalsmithBabelPlugin(files, metalsmith, done) {
    Object.keys(files).forEach(function(file) {
      if (path.extname(file).toLowerCase() !== '.js') {
        return;
      }

      var result = babel.transform(String(files[file].contents), objectAssign({}, options, {
        filename: path.join(metalsmith._directory, metalsmith._source, file),
        filenameRelative: file
      }));

      if (result.map) {
        files[file + '.map'] = {
          mode: files[file].mode,
          contents: new Buffer(JSON.stringify(result.map))
        };

        result.code += '\n//# sourceMappingURL=' + file + '.map\n';
      }

      files[file].contents = new Buffer(result.code);
    });
    done();
  };
};
