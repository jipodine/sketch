const debug = require('debug')('sketch:app');
const d3 = require('d3');

let app = window.app || {};

app.polyfills = require('./polyfills.js');
app.sketch = require('./sketch.js');
app.data = require('./data.js');

const domain = { x: [-10, 10], y: [-5, 5] };
app.dataSet = new app.data.Set(domain);

app.dataSet.addRandom(10);

app.init = function() {
  let sketch1 = new app.sketch.Sketch(d3.select('body'), app.dataSet);
}; // init

window.app = app;

window.addEventListener('DOMContentLoaded', function() {
  app.init();
});
