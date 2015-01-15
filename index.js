/*!
 * metalsmith-6to5 | MIT (c) Shinnosuke Watanabe
 * https://github.com/6to5/metalsmith-6to5
*/
'use strict';

var path = require('path');

var objectAssign = require('object-assign');
var to5 = require('6to5');

module.exports = function metalsmith6to5(options) {
  return function metalsmith6to5Plugin(files, metalsmith, done) {
    Object.keys(files).forEach(function(file) {
      if (path.extname(file).toLowerCase() !== '.js') {
        return;
      }

      var result = to5.transform(String(files[file].contents), objectAssign({}, options, {
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
