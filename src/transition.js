'use strict';

const debug = require('debug')('sketch:transition');

const data = require('./data.js');
const control = require('./transition-control.js');
const svg = require('./transition-svg.js');

let e = {};


e.Transition = class {
  constructor(params) {
    // class
    e.Transition.count = e.Transition.count || 0;
    ++e.Transition.count;

    // object
    this.top = params.top;
    this.$parent = params.$parent;
    this.structure = params.structure;
    this.domain = params.domain;
    this.data = new data.Set();
    this.id = 'transition-' + e.Transition.count;

    this.transition = new data.SetTransition( { duration: 2,
                                                easeStyle: 'cubic',
                                                easeStyleExtension: 'in-out' } );

    this.sketchStart = params.start;
    this.sketchEnd = params.end;

    this.$selection = this.$parent.append('div')
      .attr('class', 'transition')
      .attr('id', this.id);

    this.control = new control.TransitionControl(this);

    const svgWidth = this.$selection.node().clientWidth;
    const svgHeight = Math.floor(svgWidth * (this.domain.y[1] - this.domain.y[0])
                              / (this.domain.x[1] - this.domain.x[0]) );
    this.svg = new svg.TransitionSVG(this, svgWidth, svgHeight);
  }

  update() {
    this.control.update();
    this.svg.update();

    return this;
  }

  run(mode) {
    switch(mode) {
    case 'forward':
      this.svg.data = this.sketchEnd.data;
      this.update();
      break;
    case 'fast-forward': {
      const duration = this.transition.duration;
      this.transition.duration = 0.5;
      this.svg.data = this.sketchEnd.data;
      this.svg.update();
      this.transition.duration = duration;
      break;
    }
    case 'backward':
      this.svg.data = this.sketchStart.data;
      this.update();
      break;
    case 'fast-backward': {
      const duration = this.transition.duration;
      this.transition.duration = 0.5;
      this.svg.data = this.sketchStart.data;
      this.svg.update();
      this.transition.duration = duration;
      break;
    }
    }

    return this;
  }

};



module.exports = exports = e;
