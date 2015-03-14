const d3 = require('d3');
const debug = require('debug')('sketch:svg');

const sketch = require('./sketch.js');

let e = {};

e.SketchSVG = class {
  constructor(parent, width, height) {
    this.parent = parent;
    this.data = this.parent.data;
    this.width = width;
    this.height = height;

    this.x = d3.scale.linear()
      .domain(this.data.domain.x)
      .range([0, this.width]);

    this.y = d3.scale.linear()
      .domain(this.data.domain.y)
      .range([0, this.height]);

    this.$selection = this.parent.$selection.append('g')
      .attr('transform', 'translate(0,0)') // margins
      .append('svg')
      .attr('class', 'sketch-svg')
      .attr('id', this.parent.id.replace(/.*-/, 'sketch-svg-'))
    // .attr("pointer-events", "all")
      .on('click.svg', (d, i) => {
        debug('svg clicked: %s; %s', d, i);
      });

    this.$selection.attr('width', this.width)
      .attr('height', this.height);


    this.brush = d3.svg.brush()
      .x(this.x)
      .y(this.y)
      .on("brush", () => { this.brushed(); } )
      .on("brushend", () => { this.brushended(); } );

    this.point = this.$selection.selectAll(".point")
      .data(this.data.values)
      .enter().append("circle")
      .attr("class", "point")
      .attr("cx", (d) => { return this.x(d[0]); })
      .attr("cy", (d) => { return this.y(d[1]); })
      .attr("r", 7)
      .on('click', function (d, i) {
        debug('circle clicked: %s; %s', d, i);
        // invert selection
        var s = d3.select(this);
        s.classed('selected', !s.classed('selected') );
        d3.event.stopPropagation();
      });
    // exit remove
  }

  brushed() {
    let point = this.$selection.selectAll(".point");
    const extent = this.brush.extent();
    point.each(function(d) { d.selected = false; });
    if(this.brush.empty() ) {
      debug('brush empty');
      // d3.event.target.extent(d3.select(this.parentNode));
      //  d3.select(this.parentNode).event(svgClick);
    } else {
      point.classed("selected", function(d) {
        return d[0] >= extent[0][0] && d[0] <= extent[1][0]
          && d[1] >= extent[0][1] && d[1] <= extent[1][1];
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
    this.$selection.insert("g", ':first-child')
      .attr("class", "brush")
      .call(this.brush)
      .call(this.brush.event);
  }


};

module.exports = exports = e;
