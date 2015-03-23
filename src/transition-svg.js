'use strict';

const d3 = require('d3');
const debug = require('debug')('sketch:transition:svg');

let e = {};

e.TransitionSVG = class {
  constructor(parent, width, height) {
    this.parent = parent;
    this.domain = this.parent.domain;
    this.width = width;
    this.height = height;

    this.x = d3.scale.linear()
      .domain(this.domain.x)
      .range([0, this.width]);

    this.y = d3.scale.linear()
      .domain(this.domain.y)
      .range([0, this.height]);

    this.$selection = this.parent.$selection.append('g')
      .attr('transform', 'translate(0,0)') // margins
      .append('svg')
      .attr('class', 'transition-svg')
      .attr('id', this.parent.id.replace(/.*-/, 'transition-svg-'))
      .attr('width', this.width)
      .attr('height', this.height);

    this.update();
  }

  update() {
    // update
    const $updated = this.$selection.selectAll('.point')
            .data(this.parent.data.values, function (d) { return d.Id; });

    $updated
      .transition()
      .ease(this.parent.easeString)
      .duration(this.parent.duration * 1000)
      .attr('transform', (d) => {
        return 'translate(' + this.x(d.x) + ',' + this.y(d.y) + ')';
      });

    // exit
    $updated
      .exit()
      .remove();

    // enter
    $updated
      .enter().append('g')
      .attr('class', 'point')
      .attr('transform', (d) => {
        return 'translate(' + this.x(d.x) + ',' + this.y(d.y) + ')';
      })
      .each( function (d, i, a) {
        debug('added %s, %, %s', d, i, a);

        const $point = d3.select(this);

        $point.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', function () {
            // font-size must be a style attribute of point
            return parseFloat(d3.select('.point').style('font-size') )
              * 0.666666666666666666;
          });

        $point.append('text')
          .attr('class', 'label')
          .text( function (d2) { return (d2.Id + 1).toString(); })
          .attr('dy', '0.3333333333333333em');
      });

  }


};


module.exports = exports = e;
