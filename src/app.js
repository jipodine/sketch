'use strict';

const debug = require('debug')('sketch:app');
const d3 = require('d3');

// in case page was saved, and reloaded
document.querySelector('#sketch-app').innerHTML = '';
let app = window.app || {};

app.polyfills = require('./polyfills.js');
app.control = require('./app-control.js');
app.data = require('./data.js');
app.sketch = require('./sketch.js');
app.transition = require('./transition.js');

app.domain = { x: [-10, 10], y: [-5, 5] };
app.structure = new app.data.Structure();

const set = new app.data.Set({ name: 'random', domain: app.domain})
        .addRandom(10);

app.structure.addSet(set);

app.init = function() {
app.$selection = d3.select('#sketch-app');
  app.control1 = new app.control.AppControl(app, 'app-control-1');

  app.sketch1 = new app.sketch.Sketch({ top: app,
                                        $parent: app.$selection,
                                        structure: app.structure,
                                        domain: app.domain });

  app.sketch2 = new app.sketch.Sketch({ top: app,
                                        $parent: app.$selection,
                                        structure: app.structure,
                                        domain: app.domain });
  app.transition12 = new app.transition.Transition(
    { top: app,
      $parent: app.$selection,
      structure: app.structure,
      domain: app.domain,
      start: app.sketch1,
      end: app.sketch2 });


  app.update = function () {
// loop    app.control1.update();
    app.sketch1.update();
    app.sketch2.update();
    app.transition12.update();
  };


}; // init

window.app = app;

window.addEventListener('DOMContentLoaded', function() {
  app.init();
});
