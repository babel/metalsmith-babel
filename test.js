'use strict';

const Metalsmith = require('metalsmith');
const babel = require('.');
const test = require('tape');

test('metalsmith-babel', t => {
  t.plan(12);

  t.strictEqual(babel.name, 'metalsmithBabel', 'should have a function name.');

  new Metalsmith('.')
  .use(babel())
  .run({
    'source.js': {contents: Buffer.from('(    )    =>    1')},
    'non-js.txt': {contents: Buffer.from('Hi')}
  }, (err, files) => {
    t.strictEqual(err, null, 'should be used as a metalsmith plugin.');
    t.strictEqual(
      String(files['source.js'].contents),
      '() => 1;',
      'should transform JavaScript files.'
    );
    t.strictEqual(
      String(files['non-js.txt'].contents),
      'Hi',
      'should not transform non-JavaScript files.'
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
    t.strictEqual(err, null, 'should support Babel options.');
    t.notOk('dir/source.jsx' in files, 'should rename .jsx file to .js.');
    t.strictEqual(
      String(files['dir/source.js'].contents),
      'var _context;(_context=a,b).call(_context,React.createElement("div",null));\n//# sourceMappingURL=source.js.map\n',
      'should append a source map URL to the bottom of code.'
    );
    t.strictEqual(
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
      }),
      'should create a source map file.'
    );
  });

  new Metalsmith('.')
  .use(babel())
  .run({'FOO.JS': {contents: Buffer.from('1=a')}}, err => {
    t.ok(err instanceof SyntaxError, 'should fail when Babel cannot transpile the code.');
  });
});
