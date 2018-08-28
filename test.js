'use strict';

const Metalsmith = require('metalsmith');
const babel = require('.');
const test = require('tape');

test('metalsmith-babel', t => {
  t.plan(12);

  new Metalsmith('.')
  .use(babel())
  .run({
    'non-js.txt': {contents: Buffer.from('Hi')},
    'source.js': {contents: Buffer.from('(    )    =>    1')}
  }, (err, files) => {
    t.equal(err, null, 'should be used as a metalsmith plugin.');
    t.equal(
      String(files['non-js.txt'].contents),
      'Hi',
      'should not transform non-JavaScript files.'
    );
    t.equal(
      String(files['source.js'].contents),
      '() => 1;',
      'should transform JavaScript files.'
    );
  });

  new Metalsmith('.')
  .use(babel({
    presets: ['react'],
    plugins: ['transform-function-bind'],
    minified: true,
    sourceMaps: true,
    sourceRoot: 'dir'
  }))
  .run({
    'dir/source.jsx': {contents: Buffer.from('a::b(<div />)')}
  }, (err, files) => {
    t.equal(err, null, 'should support Babel options.');
    t.notOk('dir/source.jsx' in files, 'should rename .jsx file to .js.');
    t.equal(
      String(files['dir/source.js'].contents),
      'var _context;(_context=a,b).call(_context,React.createElement("div",null));\n//# sourceMappingURL=source.js.map\n',
      'should append a source map URL to the bottom of code.'
    );
    t.equal(
      String(files['dir/source.js.map'].contents),
      JSON.stringify({
        version: 3,
        sources: ['source.jsx'],
        names: ['b'],
        mappings: 'aAAA,YAAGA,CAAH,gBAAK,+BAAL',
        file: 'dir/source.js',
        sourceRoot: 'dir',
        sourcesContent: ['a::b(<div />)']
      }),
      'should create a source map file.'
    );
  });

  new Metalsmith('.')
  .use(babel({sourceMap: 'both'}))
  .run({
    '🐟/🐠.mjs': {contents: Buffer.from('1')}
  }, (err, files) => {
    t.equal(err, null, 'should support .mjs files.');
    t.equal(
      String(files['🐟/🐠.mjs'].contents),
      '1;\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIvCfkKAubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6IvCfkJ8v8J+QoC5tanMiLCJzb3VyY2VzQ29udGVudCI6WyIxIl19',
      'should support `sourceMap` ⇆ `sourceMaps` option alias.'
    );
    t.equal(
      String(files['🐟/🐠.mjs.map'].contents),
      JSON.stringify({
        version: 3,
        sources: ['🐠.mjs'],
        names: [],
        mappings: 'AAAA',
        file: '🐟/🐠.mjs',
        sourcesContent: ['1']
      }),
      'should create a source map file.'
    );
  });

  new Metalsmith('.')
  .use(babel())
  .run({'FOO.JS': {contents: Buffer.from('1=a')}}, err => {
    t.ok(err instanceof SyntaxError, 'should fail when Babel cannot transpile the code.');
  });

  t.throws(
    () => babel({}, {}),
    /RangeError.*Expected 0 or 1 argument \(\[<Object>\]\), but got 2 arguments\./u,
    'should throw an error when it takes too many arguments.'
  );
});
