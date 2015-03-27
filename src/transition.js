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
    this.$selection = this.$parent.append('div')
      .attr('class', 'transition')
      .attr('id', this.id);
    this.start = params.start;
    this.end = params.end;

    this.duration = 2;
    this.easeStyle = 'cubic';
    this.easeStyleExtension = 'in-out';
    this.easeString = this.easeStyle + '-' + this.easeStyleExtension;

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
      this.svg.data = this.end.data;
      this.update();
      break;
    case 'fast-forward': {
      const duration = this.duration;
      this.duration = 0.5;
      this.svg.data = this.end.data;
      this.svg.update();
      this.duration = duration;
      break;
    }
    case 'backward':
      this.svg.data = this.start.data;
      this.update();
      break;
    case 'fast-backward': {
      const duration = this.duration;
      this.duration = 0.5;
      this.svg.data = this.start.data;
      this.svg.update();
      this.duration = duration;
      break;
    }
    }

    return this;
  }

  setEaseStyle(style, extension) {
    this.easeStyle = style || this.easeStyle;
    this.easeStyleExtension = extension || this.easeStyleExtension;
    this.easeString = this.easeStyle + '-' + this.easeStyleExtension;

    return this;
  }

};



module.exports = exports = e;
