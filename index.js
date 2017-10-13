/*!
 * metalsmith-babel | MIT (c) Shinnosuke Watanabe
 * https://github.com/babel/metalsmith-babel
*/
'use strict';

const path = require('path');

const babel = require('babel-core');
const SafeBuffer = require('safe-buffer').Buffer;
const toFastProperties = require('to-fast-properties');

module.exports = function metalsmithBabel(options) {
  options = Object.assign({}, options);

  return function metalsmithBabelPlugin(files, metalsmith) {
    Object.keys(files).forEach(originalFilename => {
      const ext = path.extname(originalFilename).toLowerCase();
      if (ext !== '.js' && ext !== '.jsx') {
        return;
      }

      const filename = originalFilename.replace(/\.jsx$/i, '.js');

      if (originalFilename !== filename) {
        files[filename] = files[originalFilename];
        delete files[originalFilename];
        toFastProperties(files);
      }

      const result = babel.transform(String(files[filename].contents), Object.assign({}, options, {
        filename: path.join(metalsmith.directory(), metalsmith.source(), originalFilename),
        filenameRelative: originalFilename,
        sourceMapTarget: filename
      }));

      if (result.map) {
        const sourcemapPath = `${filename}.map`;
        files[sourcemapPath] = {
          contents: SafeBuffer.from(JSON.stringify(result.map))
        };

        // https://github.com/babel/babel/blob/v6.14.0/packages/babel-core/src/transformation/file/options/config.js#L123
        if (options.sourceMap !== 'both' && options.sourceMaps !== 'both') {
          result.code += `\n//# sourceMappingURL=${
            path.relative(path.dirname(filename), sourcemapPath).replace(/\\/g, '/')
          }\n`;
        }
      }

      files[filename].contents = SafeBuffer.from(result.code);
    });
  };
};
