'use strict';

const Metalsmith = require('metalsmith');
const babel = require('.');
const test = require('tape');

test('metalsmith-babel', t => {
  t.plan(8);

  t.equal(babel.name, 'metalsmithBabel', 'should have a function name.');

  new Metalsmith('.')
  .use(babel())
  .run({
    'source.js': {contents: new Buffer('(    )    =>    1')},
    'non-js.txt': {contents: new Buffer('Hi')}
  }, (err, files) => {
    t.strictEqual(err, null, 'should be used as a metalsmith plugin.');
    t.equal(
      String(files['source.js'].contents),
      '() => 1;',
      'should transform *.js files.'
    );
    t.equal(
      String(files['non-js.txt'].contents),
      'Hi',
      'should not transform non-*.js files.'
    );
  });

  new Metalsmith('.')
  .use(babel({
    presets: ['es2015'],
    plugins: ['transform-function-bind'],
    sourceMap: true,
    sourceRoot: 'dir'
  }))
  .run({
    'dir/source.js': {contents: new Buffer('"use strict";let a = b::c;')}
  }, (err, files) => {
    t.strictEqual(err, null, 'should support Babel options.');
    t.equal(
      String(files['dir/source.js'].contents),
      '"use strict";\n\nvar _context;\n\nvar a = (_context = b, c).bind(_context);\n//# sourceMappingURL=source.js.map\n',
      'should append a source map URL to the bottom of code.'
    );
    t.equal(
      String(files['dir/source.js.map'].contents),
      JSON.stringify({
        version: 3,
        sources: ['source.js'],
        names: [],
        mappings: 'AAAA,YAAY,CAAC;;;;AAAA,IAAI,CAAC,eAAG,CAAC,EAAE,CAAC,gBAAA,CAAC',
        file: 'source.js',
        sourceRoot: 'dir',
        sourcesContent: ['"use strict";let a = b::c;']
      }),
      'should create a source map file.'
    );
  });

  new Metalsmith('.')
  .use(babel())
  .run({'FOO.JS': {contents: new Buffer('1=a')}}, err => {
    t.ok(err instanceof SyntaxError, 'should fail when Babel cannot transpile the code.');
  });
});
