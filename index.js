'use strict';

const {dirname, extname, join, relative, resolve} = require('path');
const {promisify} = require('util');

const inspectWithKind = require('inspect-with-kind');
const isPlainObject = require('lodash/isPlainObject');
const {loadOptions, transform} = require('@babel/core');
const some = require('lodash/some');

const promisifiedBabelTransform = promisify(transform);

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
	// https://github.com/babel/babel/blob/v7.2.0/packages/babel-core/src/config/validation/options.js#L386
	// > .sourceMap is an alias for .sourceMaps
	const needsSourceMappingUrl = options.sourceMaps !== 'both' && options.sourceMap !== 'both';

	return async function metalsmithBabelPlugin(files, metalsmith, done) {
		let results;

		try {
			results = await Promise.all(Object.keys(files).reduce((processedFiles, originalFilename) => {
				const ext = extname(originalFilename).toLowerCase().slice(1);

				if (ext !== 'js' && ext !== 'mjs' && ext !== 'jsx' && ext !== 'ts' && ext !== 'tsx') {
					return processedFiles;
				}

				const loadedOptions = loadOptions({
					...options,
					ast: false,
					filename: join(metalsmith.directory(), metalsmith.source(), originalFilename),
					filenameRelative: originalFilename
				});

				if (ext.startsWith('ts') && !some(loadedOptions.plugins, {key: 'transform-typescript'})) {
					return processedFiles;
				}

				processedFiles.push((async () => {
					const {code, map} = await promisifiedBabelTransform(String(files[originalFilename].contents), loadedOptions);

					return {
						originalFilename,
						filename: originalFilename.replace(/\.(?:[jt]sx|ts)$/ui, '.js'),
						code,
						map
					};
				})());

				return processedFiles;
			}, []));
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
