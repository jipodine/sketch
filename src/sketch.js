'use strict';

const debug = require('debug')('sketch:sketch');

const data = require('./data.js');
const control = require('./sketch-control.js');
const svg = require('./sketch-svg.js');

let e = {};


e.Sketch = class {
  constructor(params) {
    // class
    e.Sketch.count = e.Sketch.count || 0;
    ++e.Sketch.count;

    // object
    this.top = params.top;
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
    debug('sketch ' + this.id + ' updated');
    this.control.update();
    this.svg.update();

    return this;
  }

  incrementSelectedId() {
    this.svg.$selection.selectAll('.selected')
      .sort(data.point.descendingId)
      .each( (d) => {
        this.data.incrementPointId(d);
      } );
    this.update();
    return this;
  }

  decrementSelectedId() {
    this.svg.$selection.selectAll('.selected')
      .sort(data.point.ascendingId)
      .each( (d) => {
        this.data.decrementPointId(d);
      } );
    this.update();
    return this;
  }

};



module.exports = exports = e;
