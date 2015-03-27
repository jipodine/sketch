'use strict';

const d3 = require('d3');
const debug = require('debug')('sketch:transition:svg');

const sketchSVG = require('./sketch-svg.js');

let e = {};

e.TransitionSVG = class extends sketchSVG.SketchSVG {
  constructor(parent, width, height) {
    super(parent, width, height);
    this.drag = d3.behavior.drag(); // no drag
    this.$selection
      .attr('class', 'transition-svg')
      .attr('id', this.parent.id.replace(/.*-/, 'transition-svg-'));
  }

};


module.exports = exports = e;
