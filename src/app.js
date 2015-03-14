const debug = require('debug')('sketch:app');
const d3 = require('d3');

const sketch = require('./sketch.js');

let app = window.app || {};


let data = {};
data.domain = { x: [-10, 10], y: [-5, 5] };
data.values = d3.range(10).map(function () {
  const range = { x: data.domain.x[1] - data.domain.x[0],
                  y: data.domain.y[1] - data.domain.y[0] };
  return [ Math.random() * range.x +  data.domain.x[0],
           Math.random() * range.y +  data.domain.y[0] ];
});

app.init = function() {
  let sketch1 = new sketch.Sketch(d3.select('body'), data);
}; // init

window.app = app;

window.addEventListener('DOMContentLoaded', function() {
  app.init();
});
