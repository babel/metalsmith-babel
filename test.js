'use strict';

const Metalsmith = require('metalsmith');
const metalsmithBabel = require('.');
const test = require('tape');

test('metalsmith-babel', t => {
	t.plan(20);

	new Metalsmith('.')
	.use(metalsmithBabel())
	.run({
		'non-js.txt': {contents: Buffer.from('Hi')},
		'typescript.ts': {contents: Buffer.from('null        ;')},
		'source.js': {contents: Buffer.from('(    )    =>    1')}
	}, (err, files) => {
		t.equal(err, null, 'should be used as a metalsmith plugin.');
		t.equal(
			files['non-js.txt'].contents.toString(),
			'Hi',
			'should not transform non-JavaScript files.'
		);
		t.equal(
			files['typescript.ts'].contents.toString(),
			'null        ;',
			'should not transform TypeScript files when @babel/preset-typescript is not loaded.'
		);
		t.equal(
			files['source.js'].contents.toString(),
			'() => 1;',
			'should transform JavaScript files.'
		);
	});

	new Metalsmith('.')
	.use(metalsmithBabel({
		presets: ['@babel/react'],
		plugins: ['@babel/plugin-proposal-function-bind'],
		minified: true,
		sourceMaps: true,
		sourceRoot: 'dir'
	}))
	.run({
		'dir/source.jsx': {contents: Buffer.from('a::b(<p />)')}
	}, (err, files) => {
		t.equal(err, null, 'should support Babel options.');
		t.notOk('dir/source.jsx' in files, 'should rename .jsx file to .js.');
		t.equal(
			files['dir/source.js'].contents.toString(),
			'var _context;(_context=a,b).call(_context,React.createElement("p",null));\n//# sourceMappingURL=source.js.map\n',
			'should append a source map URL to the bottom of code.'
		);
		t.equal(
			files['dir/source.js.map'].contents.toString(),
			JSON.stringify({
				version: 3,
				sources: ['source.jsx'],
				names: ['a', 'b'],
				mappings: 'aAAA,UAAAA,CAAC,CAAEC,CAAH,gBAAK,6BAAL',
				sourceRoot: 'dir',
				sourcesContent: ['a::b(<p />)'],
				file: 'dir/source.js'
			}),
			'should create a source map file.'
		);
	});

	new Metalsmith('.')
	.use(metalsmithBabel({sourceMap: 'both'}))
	.run({
		'🐟/🐠.mjs': {contents: Buffer.from('1')}
	}, (err, files) => {
		t.equal(err, null, 'should support .mjs files.');
		t.equal(
			files['🐟/🐠.mjs'].contents.toString(),
			'1;\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIvCfkKAubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiMSJdfQ==',
			'should support `sourceMap` ⇆ `sourceMaps` option alias.'
		);
		t.equal(
			files['🐟/🐠.mjs.map'].contents.toString(),
			JSON.stringify({
				version: 3,
				sources: ['🐠.mjs'],
				names: [],
				mappings: 'AAAA',
				sourcesContent: ['1'],
				file: '🐟/🐠.mjs'
			}),
			'should create a source map file.'
		);
	});

	new Metalsmith('.')
	.use(metalsmithBabel({
		presets: ['@babel/preset-typescript']
	}))
	.run({
		'source.ts': {contents: Buffer.from('const x: number = 1')}
	}, (err, files) => {
		t.equal(err, null, 'should support TypeScript when @babel/preset-typescript is loaded.');

		t.equal(
			files['source.js'].contents.toString(),
			'const x = 1;',
			'should compile TypeScript when @babel/preset-typescript is loaded.'
		);
	});

	new Metalsmith('.')
	.use(metalsmithBabel({
		presets: ['@babel/react', '@babel/preset-typescript'],
		comments: false
	}))
	.run({
		'source.tsx': {contents: Buffer.from(`declare namespace JSX {
  interface IntrinsicElements {
    foo: { bar?: boolean }
  }
}
<foo bar />;`)}
	}, (err, files) => {
		t.equal(err, null, 'should support TSX when @babel/preset-typescript is loaded.');

		t.equal(
			files['source.js'].contents.toString(),
			'React.createElement("foo", {\n  bar: true\n});',
			'should compile TSX when both @babel/preset-react and @babel/preset-typescript are loaded.'
		);
	});

	new Metalsmith('.')
	.use(metalsmithBabel())
	.run({'FOO.JS': {contents: Buffer.from('1=a')}}, ({code}) => {
		t.equal(
			code,
			'BABEL_PARSE_ERROR',
			'should fail when Babel cannot transpile the code.'
		);
	});

	new Metalsmith('.')
	.use(metalsmithBabel({
		preset: 'must be `preset**s**`'
	}))
	.run({'source.tsx': {contents: Buffer.from('')}}, err => {
		t.ok(
			err.toString().startsWith('ReferenceError: Unknown option: .preset.'),
			'should fail when it takes an unknown option.'
		);
	});

	new Metalsmith('.')
	.use(metalsmithBabel({
		plugins: ['babel-plugin-notfound']
	}))
	.run({'source.ts': {contents: Buffer.from('')}}, ({message}) => {
		t.equal(
			message,
			`Cannot find module 'babel-plugin-notfound' from '${__dirname}'`,
			'should fail when Babel cannot resolve the path of a given plugin.'
		);
	});

	t.throws(
		() => metalsmithBabel(new Int32Array()),
		/^TypeError.*Expdected an options object to set @babel\/core options, but got Int32Array \[\]\./u,
		'should throw an error when it takes a non-plain object argument.'
	);

	t.throws(
		() => metalsmithBabel({}, {}),
		/^RangeError.*Expected 0 or 1 argument \(\[<Object>\]\), but got 2 arguments\./u,
		'should throw an error when it takes too many arguments.'
	);
});
