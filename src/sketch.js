const d3 = require('d3');
const debug = require('debug')('sketch:sketch');

const data = require('./data.js');
const control = require('./sketch-control.js');
const svg = require('./sketch-svg.js');

let e = {};


e.Sketch = class {
  constructor(params) {
    // class
    e.Sketch.count = e.Sketch.count || 0;
    ++ e.Sketch.count;

    // object
    this.$parent = params.$parent;
    this.structure = params.structure;
    this.domain = params.domain;
    this.data = new data.Set();
    this.id = 'sketch-' + e.Sketch.count;
    this.$selection = this.$parent.append('div')
      .attr('class', 'sketch')
      .attr('id', this.id);

    this.control = new control.SketchControl(this);

    const svgWidth = this.$selection.node().clientWidth;
    const svgHeight = Math.floor(svgWidth * (this.domain.y[1] - this.domain.y[0])
                              / (this.domain.x[1] - this.domain.x[0]) );

    this.svg = new svg.SketchSVG(this, svgWidth, svgHeight);
  }

  update() {
    this.svg.update();
  }

};



module.exports = exports = e;
