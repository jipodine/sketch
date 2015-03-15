const d3 = require('d3');
const debug = require('debug')('sketch:control');

const sketch = require('./sketch.js');

let e = {};

let exclusiveChildSelection = function (node) {
    var sisters = node.parentNode.childNodes;
    d3.selectAll(sisters)
      .classed('selected', false);
    d3.select(node)
      .classed('selected', true);
};


e.SketchControl = class {
  constructor(parent) {
    this.parent = parent;

    this.$selection = this.parent.$selection.append('div')
      .attr('class', 'sketch-control')
      .attr('id', parent.id.replace(/.*-/,'sketch-control-'));

    this.$selection.append('button')
      .attr('class', 'sketch-control-element')
      .classed('add', true)
      .text('Add')
      .on('click', (d, i) => {
        this.setMode('add');
      });

    this.$selection.append('button')
      .attr('class', 'sketch-control-element')
      .classed('select', true)
      .text('Select')
      .on('click', (d, i) => {
        this.setMode('select');
      });

    this.$selection.append('button')
      .attr('class', 'sketch-control-element')
      .classed('delete', true)
      .text('Delete')
      .on('click', (d, i) => {
        this.setMode('delete');
      });

    this.$selection.append('button')
      .attr('class', 'sketch-control-element')
      .classed('move', true)
      .text('Move')
      .on('click', (d, i) => {
        this.setMode('move');
      });

    this.setMode('add');
  }

  setMode(mode) {
    let sisters = d3.selectAll(this.$selection.node().childNodes)
      .classed('selected', false);

    switch(mode) {
    case 'add':
      sisters.filter('.add').classed('selected', true);
      this.brushRemove();
      break;
    case 'select':
      sisters.filter('.select').classed('selected', true);
      this.brushAdd();
      break;
    case 'delete':
      sisters.filter('.delete').classed('selected', true);
      this.brushRemove();
      break;
    case 'move':
      sisters.filter('.move').classed('selected', true);
      this.brushRemove();
      break;
    }
    this.mode = mode;
    return this;
  }

  brushAdd() {
    if (typeof this.parent.svg !== 'undefined') {
      this.parent.svg.brushAdd();
    }
    return this;
  }

  brushRemove() {
    if (typeof this.parent.svg !== 'undefined') {
      this.parent.svg.brushRemove();
    }
    return this;
  }

}; // SketchControl class


module.exports = exports = e;
