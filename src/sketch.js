const d3 = require('d3');
const debug = require('debug')('sketch:sketch');

const control = require('./sketch-control.js');
const svg = require('./sketch-svg.js');

let e = {};


e.Sketch = class {
  constructor($parent, data) {
    // class
    e.Sketch.count = e.Sketch.count || 0;
    ++ e.Sketch.count;

    // object
    this.$parent = $parent;
    this.data = data;
    this.id = 'sketch-' + e.Sketch.count;
    this.$selection = $parent.append('div')
      .attr('class', 'sketch')
      .attr('id', this.id);

    this.control = new control.SketchControl(this);

    const svgWidth = this.$selection.node().clientWidth;
    const svgHeight = Math.floor(svgWidth * (data.domain.y[1] - data.domain.y[0])
                              / (data.domain.x[1] - data.domain.x[0]) );

    this.svg = new svg.SketchSVG(this, svgWidth, svgHeight);
  }


};



module.exports = exports = e;
