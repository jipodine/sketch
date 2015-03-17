const debug = require('debug')('sketch:app');
const d3 = require('d3');

let app = window.app || {};

app.polyfills = require('./polyfills.js');
app.sketch = require('./sketch.js');
app.data = require('./data.js');

app.domain = { x: [-10, 10], y: [-5, 5] };
app.structure = new app.data.Structure();

const set = new app.data.Set({ name: 'random',
                               domain: app.domain})
        .addRandom(10);
app.structure.addSet(set);

app.init = function() {
  app.sketch1 = new app.sketch.Sketch({ $parent: d3.select('body'),
                                        structure: app.structure,
                                        domain: app.domain });
}; // init

window.app = app;

window.addEventListener('DOMContentLoaded', function() {
  app.init();
});
