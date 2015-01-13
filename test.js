'use strict';

var Metalsmith = require('metalsmith');
var to5 = require('./');
var test = require('tape');

function fixtures() {
  return {
    'source.js': {
      contents: new Buffer('"use strict";\nlet a = 1')
    },
    'non-js.txt': {
      contents: new Buffer('Hi')
    }
  };
}

test('metalsmith-6to5', function(t) {
  t.plan(8);

  t.equal(to5.name, 'metalsmith6to5', 'should have a function name.');

  new Metalsmith('./')
  .use(to5())
  .run(fixtures(), function(err, files) {
    t.strictEqual(err, null, 'should be used as a metalsmith plugin.');
    t.equal(
      String(files['source.js'].contents),
      '"use strict";\nvar a = 1;',
      'should turn ES6+ code into ES5.'
    );
    t.equal(
      String(files['non-js.txt'].contents),
      'Hi',
      'should transform only *.js files.'
    );
  });

  new Metalsmith('./')
  .use(to5({sourceMap: true}))
  .run(fixtures(), function(err, files) {
    t.strictEqual(err, null, 'should support source map.');
    t.equal(
      String(files['source.js'].contents),
      '"use strict";\nvar a = 1;\n//# sourceMappingURL=source.js.map\n',
      'should append source map URL to the bottom of code.'
    );
    t.equal(
      String(files['source.js.map'].contents),
      JSON.stringify({
        version: 3,
        sources: ['source.js'],
        names: [],
        mappings: ';UACS',
        file: 'source.js',
        sourcesContent: ['"use strict";\nlet a = 1']
      }),
      'should create a source map file.'
    );
  });

  new Metalsmith('./')
  .use(to5())
  .run({'FOO.JS': {contents: new Buffer('1=a')}}, function(err) {
    t.ok(err.loc, 'should fail when 6to5 cannot transpile the code.');
  });
});
