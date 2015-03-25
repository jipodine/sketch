'use strict';

const d3 = require('d3');
const debug = require('debug')('sketch:transition:control');

let e = {};

e.TransitionControl = class {
  constructor(parent) {
    const that = this;

    this.parent = parent;
    this.structure = this.parent.structure;
    this.id = this.parent.id.replace(/.*-/, 'transition-control-');

    this.$selection = this.parent.$selection.append('div')
      .attr('class', 'transition-control')
      .attr('id', this.id);

    this.$selection.append('button')
      .attr('class', 'transition-control-element')
      .classed('backward', true)
      .text('Backward')
      .on('click', () => { this.parent.run('backward'); });

    this.$duration = this.$selection.append('input')
      .attr('class', 'transition-control-element')
      .classed('duration', true)
      .text('duration')
      .attr('value', this.parent.duration)
      .attr('type', 'number')
      .attr('step', '0.5')
      .attr('min', '0')
      .attr('max', '60')
      .on('change', function () {
        that.parent.duration = that.$duration.node().value;
      });

    const easeStyleStrings = [ 'linear', 'cubic', 'quad', 'sin',
                               'exp', 'circle', 'elastic', 'back', 'bounce' ];
    this.$easeStyle = this.$selection.append('select')
      .attr('class', 'transition-control-element');
      this.$easeStyle.on('change', () => {
        if(d3.event.defaultPrevented) {
          debug('transition ease change prevented');
          return;
        }
        this.parent.setEaseStyle(this.$easeStyle.node().value);
        d3.event.stopPropagation();
      });

    for(let i = 0; i < easeStyleStrings.length; ++i) {
      this.$easeStyle.append('option')
        .attr('value', easeStyleStrings[i])
        .text(easeStyleStrings[i]);
    }

    const easeStyleExtensionStrings = [ 'in', 'out', 'in-out', 'out-in' ];
    this.$easeStyleExtension = this.$selection.append('select')
      .attr('class', 'transition-control-element');
      this.$easeStyleExtension.on('change', () => {
        if(d3.event.defaultPrevented) {
          debug('transition ease change prevented');
          return;
        }
        this.parent.setEaseStyle('', this.$easeStyleExtension.node().value);
        d3.event.stopPropagation();
      });

    for(let i = 0; i < easeStyleExtensionStrings.length; ++i) {
      this.$easeStyleExtension.append('option')
        .attr('value', easeStyleExtensionStrings[i])
        .text(easeStyleExtensionStrings[i]);
    }

    this.$selection.append('button')
      .attr('class', 'transition-control-element')
      .classed('forward', true)
      .text('Forward')
      .on('click', () => { this.parent.run('forward'); });

    this.update();
  }


  update() {
    this.$duration.attr('value', this.parent.duration);
    this.$easeStyle.node().value = this.parent.easeStyle;
    this.$easeStyleExtension.node().value = this.parent.easeStyleExtension;
    return this;
  }

}; // transitionControl class


module.exports = exports = e;
