'use strict';

const d3 = require('d3');
const debug = require('debug')('sketch:svg');

const data = require('./data.js');

let e = {};

e.SketchSVG = class {
  constructor(parent, width, height) {
    const that = this;
    this.parent = parent;
    this.data = this.parent.data;
    this.domain = this.parent.domain;
    this.width = width;
    this.height = height;

    this.x = d3.scale.linear()
      .domain(this.domain.x)
      .range([0, this.width]);

    this.y = d3.scale.linear()
      .domain(this.domain.y)
      .range([0, this.height]);

    this.colorScale = d3.scale.category20()
      .domain(d3.range(1, 99) ); // fixed domain

    this.$selection = this.parent.$selection.append('g')
      .attr('transform', 'translate(0,0)') // margins
      .append('svg')
      .attr('class', 'sketch-svg')
      .attr('id', this.parent.id.replace(/.*-/, 'sketch-svg-'))
      .attr('width', this.width)
      .attr('height', this.height)    // .attr('pointer-events', 'all')
      .on('click.svg', function () {
        if(d3.event.defaultPrevented) {
          debug('click.svg prevented');
          return;
        }
        debug('click.svg');

        if(that.parent.control.mode === 'add') {
          const [x, y] = d3.mouse(this);
          that.data.addPoint( {x: that.x.invert(x),
                               y: that.y.invert(y) });
          that.update();
        }
      });

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

    this.brush = d3.svg.brush()
      .x(this.x)
      .y(this.y)
      .on('brush', () => { this.brushed(); } )
      .on('brushend', () => { this.brushended(); } );

    this.drag = d3.behavior.drag()
      .origin(function(d) {
        return { x: that.x(d.x),
                 y: that.y(d.y) };
      })
      .on('dragstart.svg', function () {
        debug('dragstart.svg');
      })
      .on('drag.svg', function (d) {
        if(d3.event.defaultPrevented) {
          debug('drag.svg prevented');
          return;
        }

        let $move = d3.select(this);
        if($move.classed('selected') ) {
          $move = e.sistersSelectedSelection($move);
        }

        const translate = { x: d3.event.x - that.x(d.x),
                            y: d3.event.y - that.y(d.y) };
        $move.attr('transform', function (d2) {
          return 'translate(' + (that.x(d2.x) + translate.x) + ','
            + (that.y(d2.y) + translate.y) + ')';
        });

        d3.event.sourceEvent.stopPropagation();
      }) // drag
      .on('dragend.svg', function () {
        debug('dragend.svg');
        let $moved = d3.select(this);
        if($moved.classed('selected') ) {
          $moved = e.sistersSelectedSelection($moved);
        }

        let updated = false;
        for (let s = 0; s < $moved[0].length; ++s) {
          let avatar = $moved[0][s].__data__;
          const index = that.data.values.findIndex( (element) => {
            return data.point.same(element, avatar);
          });

          if(index >= 0 && index < that.data.values.length) {
            let original = that.data.values[index];
            const translate = d3.transform(d3.select($moved[0][s])
                                           .attr('transform')).translate;
            original.x = that.x.invert(translate[0]);
            original.y = that.y.invert(translate[1]);
            updated = true;
          }
        } // each point of the selection

        if(updated) {
          that.update();
        }

      }); // dragend

    this.update();
  }

  update() {
    const that = this;

    // update
    const $updated = this.$selection.selectAll('.point')
            .data(this.data.values, function (d) {
              return d.id;
            });

    $updated
      .style('fill', function(d) {return that.colorScale(d.id); })
      .style('stroke', function(d) { return that.colorScale(d.id); })
      .selectAll('.label')
      .text( function () {
        return d3.select(this).node().parentNode.__data__.id.toString();
      });

    $updated
      .transition()
      .ease( (this.parent.transition
              ? this.parent.transition.easeString
              : 'linear') )
      .duration( (this.parent.transition
                  ? this.parent.transition.duration * 1000
                  : 0) )
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
      .style('fill', function(d) { return that.colorScale(d.id); })
      .style('stroke', function(d) { return that.colorScale(d.id); })
      .on('click.svg', function () {
        debug('click.svg');
        if(d3.event.defaultPrevented) {
          debug('click.svg prevented');
          return;
        }

        switch(that.parent.control.mode) {
        case 'add':
          e.invertSelection(d3.select(this));
          break;

        case 'select':
          e.invertSelection(d3.select(this));
          break;

        case 'delete':
          let $deleted = d3.select(this);
          if($deleted.classed('selected') ) {
            $deleted = e.sistersSelectedSelection($deleted);
          }

          let updated = false;
          for (let s = 0; s < $deleted[0].length; ++s) {
            const avatar = $deleted[0][s].__data__;
            const index = that.data.values.findIndex( (element) => {
              return data.point.same(element, avatar);
            });

            if(index >= 0 && index < that.data.values.length) {
              that.data.removePointByIndex(index);
              // remove selection (which is index-based)
              d3.select($deleted[0][s]).classed('selected', false);
              updated = true;
            }
          } // for each point of the selection

          if(updated) {
            that.update();
          }
          break;

        case 'move':
          e.invertSelection(d3.select(this));
          break;
        }

        d3.event.stopPropagation();
      }) // point clicked

      .call(this.drag)

      .each( function (d, i, e) {
        debug('added %s, %, %s', d, i, e);

        const $point = d3.select(this);

        $point.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', function () {
            // font-size must be a style attribute of point
            return parseFloat(d3.select('.point').style('font-size') )
              * 0.666666666666666; // circle around 2 digits
          })
          .on('click.circle', function () {
            debug('click.circle');
          });

        $point.append('text')
          .attr('class', 'label')
          .attr('dy', '0.3333333333333333em') // vertical centre
          .text( function () {
            return d3.select(this).node().parentNode.__data__.id.toString();
          });
      });

  }

  brushed() {
    const $point = this.$selection.selectAll('.point');
    const extent = this.brush.extent();
    $point.each(function(d) { d.selected = false; });
    if(this.brush.empty() ) {
      debug('brush empty');
    } else {
      $point.classed('selected', function(d) {
        return d.x >= extent[0][0] && d.x <= extent[1][0]
          && d.y >= extent[0][1] && d.y <= extent[1][1];
      });
    }
  }

  brushended() {
    if (!d3.event.sourceEvent) {
      debug('brush not not source');
      // only transition after input
      return;
    }
    debug('brush source event');
  }

  brushRemove() {
    d3.selectAll(this.$selection.node().childNodes)
      .filter('.brush').remove();
  }

  brushAdd() {
    if(d3.selectAll(this.$selection.node().childNodes)
       .filter('.brush')[0].length === 0) {
      this.$selection.insert('g', ':first-child')
        .attr('class', 'brush')
        .call(this.brush)
        .call(this.brush.event);
    }
  }

};

// helpers
e.invertSelection = function($point) {
  $point.classed('selected', !$point.classed('selected') );
};

e.sistersSelectedSelection = function($point) {
  return d3.selectAll($point.node().parentNode.childNodes)
    .filter('.selected');
};

module.exports = exports = e;
