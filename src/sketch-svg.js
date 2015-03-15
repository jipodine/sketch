const d3 = require('d3');
const debug = require('debug')('sketch:svg');

const sketch = require('./sketch.js');
const data = require('./data.js');

let e = {};

e.SketchSVG = class {
  constructor(parent, width, height) {
    const that = this;
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
      .attr('width', this.width)
      .attr('height', this.height)    // .attr("pointer-events", "all")
      .on('click.svg', function (d, i)  {
        if(d3.event.defaultPrevented) {
          debug('svg click prevented');
          return;
        }

        if(that.parent.control.mode === 'add') {
          const [x, y] = d3.mouse(this);
          that.data.addPoint( {x: that.x.invert(x),
                               y: that.y.invert(y) });
          that.update();
        }
      });

    this.brush = d3.svg.brush()
      .x(this.x)
      .y(this.y)
      .on("brush", () => { this.brushed(); } )
      .on("brushend", () => { this.brushended(); } );

    this.drag = d3.behavior.drag()
      .origin(function(d) {
        const $origin = d3.select(this);
        const translate = e.getTranslate($origin);
        return { x: $origin.attr('x') + translate.x,
                 y: $origin.attr('y') + translate.y };
      }) // origin
      .on('drag.svg', function (d,i) {
        let $move = d3.select(this);
        if($move.classed('selected') ) {
          $move = e.sistersSelectedSelection($move);
        }

        $move.attr('transform', 'translate('
                   + d3.event.x + ',' + d3.event.y + ')' );

        d3.event.sourceEvent.stopPropagation();
      }) // drag
      .on('dragend.svg', function (d, i) {
        let $moved = d3.select(this);
        if($moved.classed('selected') ) {
          $moved = e.sistersSelectedSelection($moved);
        }

        let updated = false;
        for (let s = 0; s < $moved[0].length; ++ s) {
          const avatar = $moved[0][s].__data__;
          const index = that.data.values.findIndex( (e, i) => {
            return that.data.values[i].sameAs(avatar);
          });

          if(index >= 0 && index < that.data.values.length) {
            let original = that.data.values[index];
            const translate = e.getTranslate($moved);
            original.x =
              that.x.invert(that.x(original.x) + translate.x);
            original.y =
              that.y.invert(that.y(original.y) + translate.y);
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
    // exit
    this.$selection.selectAll(".point")
      .data(this.data.values)
      .exit()
      .remove();

    // update
    this.$selection.selectAll(".point")
      .data(this.data.values)
      .attr("cx", (d) => { return this.x(d.x); })
      .attr("cy", (d) => { return this.y(d.y); })
      .attr('transform', function (d, i) {
        let $point = d3.select(this);
        if($point.attr('transform') ) {
          $point.attr("transform", $point.attr("transform")
                      .replace(/translate\([+-]?[0-9]+\,[+-]?[0-9]+\)/,'') );
        }
        return $point.attr('transform') || null;
      });

    // enter
    this.$selection.selectAll(".point")
      .data(this.data.values)
      .enter().append("circle")
      .attr("class", "point")
      .attr("cx", (d) => { return this.x(d.x); })
      .attr("cy", (d) => { return this.y(d.y); })
      .attr("r", 7)
      .attr("name", (d) => { return d.name; })
      .on('click', function (d, i) {
        if(d3.event.defaultPrevented) {
          debug('svg click prevented');
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
          for (let s = 0; s < $deleted[0].length; ++ s) {
            const avatar = $deleted[0][s].__data__;
            const index = that.data.values.findIndex( (e, i) => {
              return that.data.values[i].sameAs(avatar);
            });

            if(index >= 0 && index < that.data.values.length) {
              that.data.values.splice(index, 1);
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
          // drag
          break;
        }

        d3.event.stopPropagation();
      }) // circle clicked

      .call(this.drag);
  }


  brushed() {
    const $point = this.$selection.selectAll(".point");
    const extent = this.brush.extent();
    $point.each(function(d) { d.selected = false; });
    if(this.brush.empty() ) {
      debug('brush empty');
      // d3.event.target.extent(d3.select(this.parentNode));
      //  d3.select(this.parentNode).event(svgClick);
    } else {
      $point.classed("selected", function(d) {
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
      this.$selection.insert("g", ':first-child')
        .attr("class", "brush")
        .call(this.brush)
        .call(this.brush.event);
    }
  }

};

// helpers
e.invertSelection = function($point) {
  $point.classed('selected', ! $point.classed('selected') );
};

e.sistersSelectedSelection = function($point) {
  return d3.selectAll($point.node().parentNode.childNodes)
    .filter('.selected');
};

e.getTranslate = function($point) {
  return { x: d3.transform($point.attr('transform')).translate[0],
           y: d3.transform($point.attr('transform')).translate[1] };
};

module.exports = exports = e;
