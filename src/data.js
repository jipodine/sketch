'use strict';

let e = {};

e.randomName = function (size = 3) {
  const v = 'aeiouy';
  const c = 'zrtpsdfghjklmwxcvbn';

  let flip = Math.random() > 0.5;
  let name = '';
  for(let i = 0; i < size; ++i, flip = !flip) {
    const l = flip ? c : v;
    name += l.charAt(Math.floor(Math.random() * l.length) );
  }
  return name;
};

e.point = {};
e.point.construct = function (point = {}) {
  let that = {};
  that.x = point.x || 0;
  that.y = point.y || 0;
  that.id = point.id || 0;
  return that;
};

e.point.same = function(point1, point2) {
  return point1.x === point2.x
    && point1.y === point2.y
    && point1.id === point2.id;
};

e.point.ascendingId = function(point1, point2) {
  return (point1.id < point2.id
          ? -1
          : (point1.id > point2.id
             ? 1
             : (point1.id >= point2.id
                ? 0
                : NaN
               )
            )
         );
};

e.point.descendingId = function(point1, point2) {
  return (point1.id > point2.id
          ? -1
          : (point1.id < point2.id
             ? 1
             : (point1.id <= point2.id
                ? 0
                : NaN
               )
            )
         );
};

e.Set = class {
  constructor(set) {
    this.domain = (set && set.domain
                   ? e.jsonClone(set.domain)
                   : { x: [-1, 1], y: [-1, 1] } );

    this.values = (set && set.values
                   ? e.jsonClone(set.values)
                   : [] );

    this.pointIdMap = (set && set.pointIdMap
                   ? e.jsonClone(set.pointIdMap)
                   : [] );

    this.name = (set && set.name
                 ? set.name // immutable
                 : e.randomName(4) );
    return this;
  }

  cloneFrom(set) {
    this.domain = e.jsonClone(set.domain);
    this.values = e.jsonClone(set.values);
    this.pointIdMap = e.jsonClone(set.pointIdMap);
    this.name = set.name; // immutable

    return this;
  }

  rename(name) {
    this.name = name;
    return this;
  }

  getNextFreeId(id) {
    // id start at 1
    while(id < 1 || typeof this.pointIdMap[id] === 'number') {
      ++id;
    }
    return id;
  }

  incrementPointId(point) {
    const index = this.pointIdMap[point.id];
    delete this.pointIdMap[point.id];
    point.id = this.getNextFreeId(point.id + 1);
    this.pointIdMap[point.id] = index;
    return this;
  }

  getPreviousFreeId(id) {
    let i = id;
    while(i > 1 && typeof this.pointIdMap[i] === 'number') {
      --i;
    }
    // id start at 1
    if(i < 1 || typeof this.pointIdMap[i] === 'number') {
      i = this.getNextFreeId(id); // no space, revert
    }
    return i;
  }

  decrementPointId(point) {
    const index = this.pointIdMap[point.id];
    delete this.pointIdMap[point.id];
    point.id = this.getPreviousFreeId(point.id - 1);
    this.pointIdMap[point.id] = index;
    return this;
  }

  addPoint(point = {} ) {
    // start to increment from the last point
    point.id = (this.values.length > 0
                ? this.values[this.values.length - 1].id + 1
                : 1); // id start at 1
    point.id = this.getNextFreeId(point.id);

    const index = this.values.length;
    this.pointIdMap[point.id] = index;
    this.values[index] = e.point.construct(point);
    return this;
  }

  addRandom(number) {
    const extend = { x: this.domain.x[1] - this.domain.x[0],
                     y: this.domain.y[1] - this.domain.y[0] };
    for(let i = 0; i < number; ++i) {
      this.addPoint( { x: Math.random() * extend.x + this.domain.x[0],
                       y: Math.random() * extend.y + this.domain.y[0]} );
    }
    return this;
  }

  removePoint(index) {
    this.values.splice(index, 1);
    const id = this.pointIdMap.findIndex( (element) => {
      return element === index;
    });
    if(id >= 0 && id < this.pointIdMap.length) {
      delete this.pointIdMap[id];
    }
  }
};


e.Structure = class {
  constructor(sets = {}) {
    this.sets = sets;
  }

  addSet(set, name = set.name) {
    this.sets[name] = new e.Set(set);
    this.sets[name].name = name;
    return this;
  }

  addSetByReference(set) {
    this.sets[set.name] = set;
    return this;
  }

  getSetByName(name) {
    return this.sets[name];
  }

  removeSetByName(name) {
    delete this.sets[name];
    return this;
  }

  nameExists(name) {
    return this.sets.hasOwnProperty(name);
  }

  getSetNames() {
    return Object.keys(this.sets);
  }

};

// no function here
e.jsonClone = function(jsonObject) {
  return JSON.parse(JSON.stringify(jsonObject) );
};

module.exports = exports = e;
