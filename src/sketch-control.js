'use strict';

const d3 = require('d3');
const debug = require('debug')('sketch:control');

let e = {};

e.SketchControl = class {
  constructor(parent) {
    const that = this;
    this.parent = parent;
    this.structure = this.parent.structure;

    this.id = this.parent.id.replace(/.*-/, 'sketch-control-');

    this.$selection = this.parent.$selection.append('div')
      .attr('class', 'sketch-control')
      .attr('id', this.id);

    ///// mode
    this.mode = null;
    this.$mode = this.$selection.append('div')
      .attr('class', 'sketch-control-mode');

    this.$mode.append('button')
      .attr('class', 'sketch-control-element')
      .classed('add', true)
      .text('Add')
      .on('click', () => { this.setMode('add'); });

    this.$mode.append('button')
      .attr('class', 'sketch-control-element')
      .classed('select', true)
      .text('Select')
      .on('click', () => { this.setMode('select'); });

    this.$mode.append('button')
      .attr('class', 'sketch-control-element')
      .classed('delete', true)
      .text('Delete')
      .on('click', () => { this.setMode('delete'); });

    this.$mode.append('button')
      .attr('class', 'sketch-control-element')
      .classed('move', true)
      .text('Move')
      .on('click', () => { this.setMode('move'); });

    this.setMode('add');

    ///// preset

    this.$preset = this.$selection.append('div')
      .attr('class', 'sketch-control-preset')
      .attr('id', parent.id.replace(/.*-/, 'sketch-preset-'));

    this.$preset.append('button')
      .attr('class', 'sketch-control-element')
      .classed('save', true)
      .text('Save')
      .on('click', () => { this.savePreset(); });

    this.$presetList = this.$preset.append('select')
      .attr('class', 'sketch-control-element')
      .on('change', () => {
        if(d3.event.defaultPrevented) {
          debug('preset list change prevented');
          return;
        }
        that.loadPreset(this.$presetList.node().value);
        d3.event.stopPropagation();
      });

    this.$preset.append('button')
      .attr('class', 'sketch-control-element')
      .classed('delete', true)
      .text('Delete')
      .on('click', () => { this.deletePreset(); });

    this.updatePresetList();
  }

  setMode(mode) {
    // exclusive
    let sisters = d3.selectAll(this.$mode.node().childNodes)
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

  deletePreset() {
    const name = window.prompt('Really delete ?', this.parent.data.name);
    if(name && this.structure.nameExists(name) ) {
      debug('%s deleted', name);
      this.structure.removeSetByName(name);
      this.updatePresetList();
    }

    return this;
  }

  savePreset() {
    const name = window.prompt('Name', this.parent.data.name);
    if(name
       && (!this.structure.nameExists(name)
           || window.confirm('Update ' + name + '?') ) ) {
      debug('%s saved', name);
      this.structure.addSet(this.parent.data, name);
      this.updatePresetList();
      this.loadPreset(name);
    }

    return this;
  }

  loadPreset(name) {
    debug('load preset: %s', name);
    const set = this.structure.getSetByName(name);
    if(set) {
      this.parent.data.cloneFrom(set);
      this.$presetList.node().value = name;
      this.parent.update();
    } else {
      console.log('Unknown preset ' + name);
    }

    return this;
  }

  update() {
    this.updatePresetList();
    return this;
  }

  updatePresetList() {
    const that = this;

    // exit
    this.$presetList.selectAll('option')
      .data(d3.keys(this.structure.sets) )
      .exit()
      .remove();

    // update
    this.$presetList.selectAll('option')
      .data(d3.keys(this.structure.sets) )
      .attr('value', (d) => { return d; })
      .text( (d) => { return d; });


    // enter
    this.$presetList.selectAll('option')
      .data(d3.keys(this.structure.sets) )
      .enter().append('option')
      .attr('value', (d) => { return d; })
      .text( (d) => { return d; })
      .on('click', function (d) {
        if(d3.event.defaultPrevented) {
          debug('preset list click prevented');
          return;
        }

        that.loadPreset(d);
        d3.event.stopPropagation();
      });

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
