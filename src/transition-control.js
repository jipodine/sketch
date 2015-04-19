'use strict';

const d3 = require('d3');
const debug = require('debug')('transition:transition:control');

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

    ///// preset
    this.$preset = this.$selection.append('div')
      .attr('class', 'transition-control-preset')
      .attr('id', parent.id.replace(/.*-/, 'transition-preset-'));

    this.$preset.append('button')
      .attr('class', 'transition-control-element')
      .classed('save', true)
      .text('Save')
      .on('click', () => { this.savePreset(); });

    this.$presetList = this.$preset.append('select')
      .attr('class', 'transition-control-element')
      .classed('list', true)
      .on('change', () => {
        if(d3.event.defaultPrevented) {
          debug('preset list change prevented');
          return;
        }
        that.loadPreset(this.$presetList.node().value);
        d3.event.stopPropagation();
      });

    this.$preset.append('button')
      .attr('class', 'transition-control-element')
      .classed('delete', true)
      .text('Delete')
      .on('click', () => { this.deletePreset(); });

    this.$selection.append('button')
      .attr('class', 'transition-control-element')
      .classed('fast-backward', true)
      .text('<<')
      .on('click', () => { this.parent.run('fast-backward'); });

    this.$selection.append('button')
      .attr('class', 'transition-control-element')
      .classed('backward', true)
      .text('<')
      .on('click', () => { this.parent.run('backward'); });

    this.$selection.append('button')
      .attr('class', 'transition-control-element')
      .classed('forward', true)
      .text('>')
      .on('click', () => { this.parent.run('forward'); });

    this.$selection.append('button')
      .attr('class', 'transition-control-element')
      .classed('fast-forward', true)
      .text('>>')
      .on('click', () => { this.parent.run('fast-forward'); });

    this.$selection.append('label')
      .attr('class', 'transition-control-element')
      .text('duration:');
    this.$duration = this.$selection.append('input')
      .attr('class', 'transition-control-element')
      .classed('duration', true)
      .attr('value', this.parent.transition.duration)
      .attr('type', 'number')
      .attr('step', '0.5')
      .attr('min', '0')
      .attr('max', '60')
      .on('change', function () {
        that.parent.transition.duration = that.$duration.node().value;
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

    this.updatePresetList();
    this.update();
  }

  deletePreset() {
    const name = window.prompt('Really delete ?', this.parent.transition.name);
    if(name && this.structure.setTransitionNameExists(name) ) {
      debug('%s deleted', name);
      this.structure.removeSetTransitionByName(name);
      this.updatePresetList();
    }

    return this;
  }

  savePreset() {
    const name = window.prompt('Name', this.parent.transition.name);
    if(name
       && (!this.structure.setTransitionNameExists(name)
           || window.confirm('Update ' + name + '?') ) ) {
      debug('%s saved', name);
      this.parent.transition.start.cloneFrom(this.parent.sketchStart.data);
      this.parent.transition.end.cloneFrom(this.parent.sketchEnd.data);
      this.structure.addSetTransition(this.parent.transition, name);

      // update all, including self
      this.parent.top.update();

      this.loadPreset(name);
    }

    return this;
  }

  loadPreset(name) {
    debug('load preset: %s', name);
    const transition = this.structure.getSetTransitionByName(name);
    if(transition) {
      this.parent.transition.cloneFrom(transition);
      this.parent.sketchStart.data.cloneFrom(this.parent.transition.start);
      this.parent.sketchStart.update();
      this.parent.sketchEnd.data.cloneFrom(this.parent.transition.end);
      this.parent.sketchEnd.update();
      this.$presetList.node().value = name;
      this.parent.update();
    } else {
      console.log('Unknown preset ' + name);
    }

    return this;
  }

  update() {
    this.updatePresetList();

    this.$duration.attr('value', this.parent.transition.duration);
    this.$easeStyle.node().value = this.parent.transition.easeStyle;
    this.$easeStyleExtension.node().value = this.parent.transition.easeStyleExtension;
    return this;
  }

  updatePresetList() {
    const that = this;

    // update
    const $updated = this.$presetList.selectAll('option')
            .data(this.structure.transitions, function (d) { return d.name; } )
            .attr('value', (d) => { return d.name; })
            .text( (d) => { return d.name; });

    // exit
    $updated
      .exit()
      .remove();


    // enter
    $updated
      .enter().append('option')
      .attr('value', (d) => { return d.name; })
      .text( (d) => { return d.name; })
      .on('click', function (d) {
        if(d3.event.defaultPrevented) {
          debug('preset list click prevented');
          return;
        }

        that.loadPreset(d.name);
        d3.event.stopPropagation();
      });

    return this;
  }

}; // transitionControl class


module.exports = exports = e;
