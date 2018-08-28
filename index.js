'use strict';

const {dirname, extname, join, relative} = require('path');

const babel = require('babel-core');
const toFastProperties = require('to-fast-properties');

module.exports = function metalsmithBabel(...args) {
  const argLen = args.length;

  if (argLen > 1) {
    throw new RangeError(`Expected 0 or 1 argument ([<Object>]), but got ${argLen} arguments.`);
  }

  const options = {...args[0]};
  let noFilesRenamed = true;

  return function metalsmithBabelPlugin(files, metalsmith) {
    for (const originalFilename of Object.keys(files)) {
      const ext = extname(originalFilename).toLowerCase();
      if (ext !== '.js' && ext !== '.mjs' && ext !== '.jsx') {
        continue;
      }

      const filename = originalFilename.replace(/\.jsx$/ui, '.js');

      if (originalFilename !== filename) {
        files[filename] = files[originalFilename];
        delete files[originalFilename];
        noFilesRenamed = false;
      }

      const result = babel.transform(String(files[filename].contents), {
        ...options,
        filename: join(metalsmith.directory(), metalsmith.source(), originalFilename),
        filenameRelative: originalFilename,
        sourceMapTarget: filename
      });

      if (result.map) {
        const sourcemapPath = `${filename}.map`;
        files[sourcemapPath] = {
          contents: Buffer.from(JSON.stringify(result.map))
        };

        // https://github.com/babel/babel/blob/v6.24.0/packages/babel-core/src/transformation/file/options/config.js#L123
        if (options.sourceMap !== 'both' && options.sourceMaps !== 'both') {
          result.code += `\n//# sourceMappingURL=${
            relative(dirname(filename), sourcemapPath).replace(/\\/ug, '/')
          }\n`;
        }
      }

      files[filename].contents = Buffer.from(result.code);
    }

    if (noFilesRenamed) {
      return;
    }

    toFastProperties(files);
  };
};
