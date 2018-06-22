'use strict';

const pathLib = require('path');

const dirname = pathLib.dirname;
const extname = pathLib.extname;
const join = pathLib.join;
const relative = pathLib.relative;

const babel = require('babel-core');
const SafeBuffer = require('safe-buffer').Buffer;
const toFastProperties = require('to-fast-properties');

module.exports = function metalsmithBabel(options) {
  options = Object.assign({}, options);
  let noFilesRenamed = true;

  return function metalsmithBabelPlugin(files, metalsmith, done) {
    Object.keys(files).forEach(originalFilename => {
      const ext = extname(originalFilename).toLowerCase();
      if (ext !== '.js' && ext !== '.mjs' && ext !== '.jsx') {
        return;
      }

      const filename = originalFilename.replace(/\.jsx$/i, '.js');

      if (originalFilename !== filename) {
        files[filename] = files[originalFilename];
        delete files[originalFilename];
        noFilesRenamed = false;
      }

      const result = babel.transform(String(files[filename].contents), Object.assign({}, options, {
        filename: join(metalsmith.directory(), metalsmith.source(), originalFilename),
        filenameRelative: originalFilename,
        sourceMapTarget: filename
      }));

      if (result.map) {
        const sourcemapPath = `${filename}.map`;
        files[sourcemapPath] = {
          contents: SafeBuffer.from(JSON.stringify(result.map))
        };

        // https://github.com/babel/babel/blob/v6.23.0/packages/babel-core/src/transformation/file/options/config.js#L123
        if (options.sourceMap !== 'both' && options.sourceMaps !== 'both') {
          result.code += `\n//# sourceMappingURL=${
            relative(dirname(filename), sourcemapPath).replace(/\\/g, '/')
          }\n`;
        }
      }

      files[filename].contents = SafeBuffer.from(result.code);
    });

    if (noFilesRenamed) {
      return done();
    }

    toFastProperties(files);
    return done();
  };
};
