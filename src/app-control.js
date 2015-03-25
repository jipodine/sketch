'use strict';

const d3 = require('d3');
const debug = require('debug')('sketch:app');

const pjson = require('../package.json');

const data = require('./data.js');

let e = {};

e.AppControl = class {
  constructor(parent, id = 'app-control-' + e.randomName(5)) {
    this.parent = parent;
    this.structure = parent.structure;
    this.id = id;

    this.$selection = this.parent.$selection.append('div')
      .attr('class', 'app-control')
      .attr('id', this.id);

    this.$grid = this.$selection.append('button')
      .attr('class', 'app-control-element')
      .classed('grid', true)
      .classed('selected', true)
      .text('Grid')
      .on('click', function () {
        const $grid = d3.select(this);
        $grid.classed('selected', !$grid.classed('selected') );
        if($grid.classed('selected') ) {
          d3.selectAll('.grid-line').style('display', null);
        } else {
          d3.selectAll('.grid-line').style('display', 'none');
        }
      });


    this.$export = this.$selection.append('button')
      .attr('class', 'app-control-element')
      .classed('export', true)
      .text('Export')
      .on('click', () => { this.exportToFile(); });

    this.$exportLink = this.$export.append('a')
      .style('display', 'none');

    this.$import = this.$selection.append('button')
      .attr('class', 'app-control-element')
      .classed('import', true)
      .text('Import')
      .on('click', () => { this.$importFile.node().click(); });

    this.$importFile = this.$selection.append('input')
      .attr('type', 'file')
      .attr('accept', 'application/json')
      .style('display', 'none')
      .on('change', () => { this.importFromFile(); });
  }

  exportToFile() {
    let x = {};
    x[pjson.name + '.version'] = pjson.version;
    x.structure = data.jsonClone(this.parent.structure);

    const blob = new Blob([ JSON.stringify(x) ], {'type': 'application/json'});
    const url = window.URL.createObjectURL(blob);

    const d = new Date();
    let name = (pjson.name + '_' + d.toLocaleString() )
          .replace(/[:/.]/g, '-').replace(/ /g, '_')
          + '.json';
    this.$exportLink.attr('href', url)
      .attr('download', name);
    this.$exportLink.node().click();

    return this;
  }

  importFromFile() {
    debug('import');
    const file = this.$importFile.node().files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = () => {
        //TODO: handle version
        const i = JSON.parse(reader.result);
        const sets = i.structure.sets;
        for(var k in sets) {
          if(sets.hasOwnProperty(k) ) {
            this.parent.structure.addSet(sets[k]);
          }
        }
        this.update();
      };
      reader.readAsText(file);
    }

    return this;
  }

  update () {
    this.parent.update();
  }

};


module.exports = exports = e;
