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

    this.colorScale = d3.scale.category20();

    this.$selection = this.parent.$selection.append('g')
      .attr('transform', 'translate(0,0)') // margins
      .append('svg')
      .attr('class', 'transition-svg')
      .attr('id', this.parent.id.replace(/.*-/, 'transition-svg-'))
      .attr('width', this.width)
      .attr('height', this.height);

    this.axisMargin = 0;

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .tickValues([-this.domain.x[0], 0, this.domain.x[0]])
      .orient('bottom');

    this.$xAxis = this.$selection.append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(' + 0 + ',' + (this.height - this.axisMargin) + ')' )
      .call(this.xAxis);

    d3.selectAll(this.$xAxis.node().childNodes).append('line')
      .classed('grid-line', true)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 2 * this.axisMargin - this.height);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .tickValues([-this.domain.y[0], 0, this.domain.y[0]])
      .orient('left');

    this.$yAxis = this.$selection.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate(' + this.axisMargin + ',' + 0 + ')' )
      .call(this.yAxis);

    d3.selectAll(this.$yAxis.node().childNodes).append('line')
      .classed('grid-line', true)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', this.width - 2 * this.axisMargin)
      .attr('y2', 0);

    this.update();
  }

  update() {
    const that = this;
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
      .style('fill', function(d) { return that.colorScale(d.Id); })
      .style('stroke', function(d) { return that.colorScale(d.Id); })
      .each( function (d, i, a) {
        debug('added %s, %, %s', d, i, a);

        const $point = d3.select(this);

        $point.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', function () {
            // font-size must be a style attribute of point
            return parseFloat(d3.select('.point').style('font-size') )
              * 0.666666666666666666; // circle around 2 digits
          });

        $point.append('text')
          .attr('class', 'label')
          .text( function (d2) { return (d2.Id + 1).toString(); })
          .attr('dy', '0.3333333333333333em'); // vertical centre
      });

  }


};


module.exports = exports = e;
