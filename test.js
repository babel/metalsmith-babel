'use strict';

const Metalsmith = require('metalsmith');
const metalsmithBabel = require('.');
const test = require('tape');

test('metalsmith-babel', t => {
	t.plan(13);

	new Metalsmith('.')
	.use(metalsmithBabel())
	.run({
		'non-js.txt': {contents: Buffer.from('Hi')},
		'source.js': {contents: Buffer.from('(    )    =>    1')}
	}, (err, files) => {
		t.equal(err, null, 'should be used as a metalsmith plugin.');
		t.equal(
			files['non-js.txt'].contents.toString(),
			'Hi',
			'should not transform non-JavaScript files.'
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
	.use(metalsmithBabel())
	.run({'FOO.JS': {contents: Buffer.from('1=a')}}, ({code}) => {
		t.equal(
			code,
			'BABEL_PARSE_ERROR',
			'should fail when Babel cannot transpile the code.'
		);
	});

	t.throws(
		() => metalsmithBabel(new Int32Array()),
		/^TypeError.*Expdected an options object to set @babel\/core options, but got Int32Array \[ {2}\]\./u,
		'should throw an error when it takes a non-plain object argument.'
	);

	t.throws(
		() => metalsmithBabel({}, {}),
		/^RangeError.*Expected 0 or 1 argument \(\[<Object>\]\), but got 2 arguments\./u,
		'should throw an error when it takes too many arguments.'
	);
});
