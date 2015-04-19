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

    // always sorted by id
    this.values = (set && set.values
                   ? e.jsonClone(set.values)
                   : [] );

    this.name = (set && set.name
                 ? set.name // immutable
                 : e.randomName(4) );
    return this;
  }

  cloneFrom(set) {
    this.domain = e.jsonClone(set.domain);
    this.values = e.jsonClone(set.values);
    this.name = set.name; // immutable

    return this;
  }

  rename(name) {
    this.name = name;
    return this;
  }

  getNextFreeId(id) {
    // ensure that id start at 1
    for(let i = 0; i < this.values.length; ++i) {
      if(this.values[i].id === id) {
        ++id;
      }
    }
    return id;
  }

  incrementPointId(point) {
    point.id = this.getNextFreeId(point.id + 1);
    // always keep sorted
    this.values.sort(e.point.ascendingId);
    return this;
  }

  getPreviousFreeId(id) {
    // ensure that id start at 1
    let idMin = id;
    for(let i = this.values.length - 1; i >= 0; --i) {
      if(this.values[i].id === idMin) {
        --idMin;
      }
    }
    // not possible: go the other way
    if(idMin < 1) {
      idMin = this.getNextFreeId(1);
    }
    return idMin;
  }

  decrementPointId(point) {
    this.removePoint(point); // we might need to go back there
    point.id = this.getPreviousFreeId(point.id - 1);
    this.values.push(e.point.construct(point) );
    // always keep sorted
    this.values.sort(e.point.ascendingId);
    return this;
  }

  addPoint(point = {} ) {
    // start to increment from the last point
    point.id = (this.values.length > 0
                ? this.values[this.values.length - 1].id + 1
                : 1); // id start at 1
    point.id = this.getNextFreeId(point.id);
    this.values.push(e.point.construct(point) );
    this.values.sort(e.point.ascendingId);
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

  getPointIndex(point) {
    const index = this.values.findIndex( (element) => {
      return e.point.same(element, point);
    });
    return index;
  }

  removePointByIndex(index) {
    this.values.splice(index, 1);
    return this;
  }

  removePoint(point) {
    this.removePointByIndex(this.getPointIndex(point));
    return this;
  }

}; // set

e.SetTransition = class {
  constructor(transition) {
    this.name = (transition && transition.name
                 ? transition.name // immutable
                 : e.randomName(5) );
    this.start = (transition && transition.start
                  ? new e.Set(transition.start)
                  : new e.Set() );
    this.end = (transition && transition.end
                ? new e.Set(transition.end)
                : new e.Set() );
    this.duration = (transition && transition.duration
                     ? transition.duration
                     : 0);

    this.setEaseStyle( (transition && transition.easeStyle
                        ? transition.easeStyle
                        : 'cubic'),
                       (transition && transition.easeStyleExtention
                        ? transition.easeStyleExtention
                        : 'in-out') );
  }

  setEaseStyle(style, extension) {
    this.easeStyle = style
      || this.easeStyle;
    this.easeStyleExtension = extension
      || this.easeStyleExtension;
    this.easeString = this.easeStyle
      + '-' + this.easeStyleExtension;

    return this;
  }


  cloneFrom(transition) {
    this.name = transition.name; // immutable
    this.start.cloneFrom(transition.start);
    this.end.cloneFrom(transition.end);
    this.duration = transition.duration;

    return this;
  }

};

e.Structure = class {
  constructor(params = {}) {
    this.sets = params.sets || [];
    this.transitions = params.transitions || [];
  }

  addSet(set, name = set.name) {
    let s = new e.Set(set);
    s.name = name;
    this.sets.push(s);
    return this;
  }

  getSetByName(name) {
    const index = this.sets.findIndex( function(element) {
      return element.name === name;
    } );
    return this.sets[index];
  }

  removeSetByName(name) {
    const index = this.sets.findIndex( function(element) {
      return element.name === name;
    } );
    if(index >= 0) {
      this.sets.splice(index, 1);
    }
    return this;
  }

  setNameExists(name) {
    const index = this.sets.findIndex( function(element) {
      return element.name === name;
    } );
    return index >= 0;
  }

  addSetTransition(transition, name = transition.name) {
    let s = new e.SetTransition(transition);
    s.name = name;
    this.transitions.push(s);
    return this;
  }

  getSetTransitionByName(name) {
    const index = this.transitions.findIndex( function(element) {
      return element.name === name;
    } );
    return this.transitions[index];
  }

  removeSetTransitionByName(name) {
    const index = this.transitions.findIndex( function(element) {
      return element.name === name;
    } );
    if(index >= 0) {
      this.transitions.splice(index, 1);
    }
    return this;
  }

  setTransitionNameExists(name) {
    const index = this.transitions.findIndex( function(element) {
      return element.name === name;
    } );
    return index >= 0;
  }


}; // structure

// no function here
e.jsonClone = function(jsonObject) {
  return JSON.parse(JSON.stringify(jsonObject) );
};

module.exports = exports = e;
