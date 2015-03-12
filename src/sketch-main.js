const debug = require('debug')('sketch');
const d3 = require('d3');

let app = window.app || {};

function exclusiveChildSelection(element) {
  d3.selectAll(element.parentNode.childNodes)
    .classed('selected', false);
  d3.select(element)
    .classed('selected', true);
}

var data = {};
data.domain = { x: [-10, 10], y: [-5, 5] };
data.values = d3.range(10).map(function () {
  const range = { x: data.domain.x[1] - data.domain.x[0],
                  y: data.domain.y[1] - data.domain.y[0] };
  return [ Math.random() * range.x +  data.domain.x[0],
           Math.random() * range.y +  data.domain.y[0] ];
});

app.init = function() {
  var addCtrl = false;

  var $sketchControl = d3.select('#sketch-control')
        .append('p')
        .attr('class', 'sketch-control');

  $sketchControl.append('button').attr('id', 'clickAdd')
    .attr('class', 'sketch-control-element')
    .text('Add')
    .on('click', function (d, i) {
      debug('Add');
      addCtrl = true;
      exclusiveChildSelection(this);
    });

  $sketchControl.append('button').attr('id', 'clickSelect')
    .attr('class', 'sketch-control-element')
    .text('Select')
    .on('click', function (d, i) {
      debug('Select');
      addCtrl = false;
      exclusiveChildSelection(this);
    });

  $sketchControl.append('button').attr('id', 'clickDelete')
    .attr('class', 'sketch-control-element')
    .text('Delete')
    .on('click', function (d, i) {
      debug('Delete');
      exclusiveChildSelection(this);
    });

  $sketchControl.append('button').attr('id', 'clickMove')
    .attr('class', 'sketch-control-element')
    .text('Move')
    .on('click', function (d, i) {
      debug('Move');
      exclusiveChildSelection(this);
    });

  var $sketch = d3.select('#sketch');

  app.sketch = {};
  app.sketch.margin = { top: 20, bottom: 20, left: 10, right: 10} ;

  const width = $sketch[0][0].clientWidth;
  const height = Math.floor(width * (data.domain.y[1] - data.domain.y[0])
                            / (data.domain.x[1] - data.domain.x[0]) );
  app.sketch.width = width - app.sketch.margin.left - app.sketch.margin.right;
  app.sketch.height = height - app.sketch.margin.top - app.sketch.margin.bottom;

  $sketch = $sketch.append('svg');

  let x = d3.scale.linear()
    .domain(data.domain.x)
    .range([0, app.sketch.width]);

  let y = d3.scale.linear()
        .domain(data.domain.y)
        .range([0, app.sketch.height]);

  $sketch.attr("width", app.sketch.width
              + app.sketch.margin.left + app.sketch.margin.right)
        .attr("height", app.sketch.height
              + app.sketch.margin.top + app.sketch.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + app.sketch.margin.left
              + "," + app.sketch.margin.top + ")");

  var brush = d3.svg.brush()
        .x(x)
        .y(y)
  // .extent(defaultExtent)
        .on("brush", brushed)
        .on("brushend", brushended);

  $sketch.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.event);

  var point = $sketch.selectAll(".point")
        .data(data.values)
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", function(d) { return x(d[0]); })
        .attr("cy", function(d) { return y(d[1]); })
        .attr("r", 4)
        .on('click', function (d,i) {
          debug('circle clicked: %s; %s', d, i);
            // invert selection
            var s = d3.select(this);
            s.classed('selected', !s.classed('selected') );
          d3.event.stopPropagation();
        });

  function brushed() {
    var point = $sketch.selectAll(".point");
    const extent = brush.extent();
    point.each(function(d) { d.selected = false; });
    if(brush.empty() ) {
      debug('brush empty');
    } else {
      point.classed("selected", function(d) {
        return d[0] >= extent[0][0] && d[0] <= extent[1][0]
          && d[1] >= extent[0][1] && d[1] <= extent[1][1];
      });
    }
  }

  function brushended() {
    if (!d3.event.sourceEvent) {
      // only transition after input
      return;
    }
    // d3.select(this).transition()
    //   .duration(brush.empty() ? 0 : 750)
    //   .call(brush.extent(defaultExtent))
    //   .call(brush.event);
  }
}; // init

window.app = app;

window.addEventListener('DOMContentLoaded', function() {
  app.init();
});
