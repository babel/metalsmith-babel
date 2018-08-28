'use strict';

const {dirname, extname, join, relative, resolve} = require('path');
const {promisify} = require('util');

const inspectWithKind = require('inspect-with-kind');
const isPlainObject = require('lodash/isPlainObject');
const {transform} = require('@babel/core');

const promisifiedBabelTransform = promisify(transform);

function isFileToBeCompiled(originalFilename) {
	const ext = extname(originalFilename).toLowerCase().slice(1);
	return ext === 'js' || ext === 'mjs' || ext === 'jsx';
}

module.exports = function metalsmithBabel(...args) {
	const argLen = args.length;

	if (argLen === 1) {
		if (!isPlainObject(args[0])) {
			throw new TypeError(`Expdected an options object to set @babel/core options, but got ${
				inspectWithKind(args[0])
			}.`);
		}
	} else if (argLen > 1) {
		throw new RangeError(`Expected 0 or 1 argument ([<Object>]), but got ${argLen} arguments.`);
	}

	const cwd = process.cwd();
	const options = {...args[0]};
	// https://github.com/babel/babel/blob/v7.0.0/packages/babel-core/src/config/validation/options.js#L380
	// > .sourceMap is an alias for .sourceMaps
	const needsSourceMappingUrl = options.sourceMaps !== 'both' && options.sourceMap !== 'both';

	return async function metalsmithBabelPlugin(files, metalsmith, done) {
		let results;

		try {
			results = await Promise.all(Object.keys(files).filter(isFileToBeCompiled).map(async originalFilename => {
				const {code, map} = await promisifiedBabelTransform(String(files[originalFilename].contents), {
					...options,
					ast: false,
					filename: join(metalsmith.directory(), metalsmith.source(), originalFilename),
					filenameRelative: originalFilename
				});

				return {
					originalFilename,
					filename: originalFilename.replace(/\.jsx$/ui, '.js'),
					code,
					map
				};
			}));
		} catch (err) {
			done(err);
			return;
		}

		for (const {originalFilename, filename, code, map} of results) {
			if (originalFilename !== filename) {
				files[filename] = files[originalFilename];
				delete files[originalFilename];
			}

			if (map) {
				const sourcemapPath = `${filename}.map`;

				map.file = filename;
				files[sourcemapPath] = {
					contents: Buffer.from(JSON.stringify(map))
				};

				if (needsSourceMappingUrl) {
					files[filename].contents = Buffer.from(`${code}
//# sourceMappingURL=${relative(resolve(cwd, dirname(filename)), sourcemapPath).replace(/\\/ug, '/')}
`);

					continue;
				}
			}

			files[filename].contents = Buffer.from(code);
		}

		done();
	};
};
