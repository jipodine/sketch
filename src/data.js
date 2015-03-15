let e = {};

e.randomName = function (size = 3) {
  const v = 'aeiouy';
  const c = 'zrtpsdfghjklmwxcvbn';

  let flip = Math.random() > 0.5;
  let name = '';
  for(let i = 0; i < size; ++ i, flip = !flip) {
    const l = flip ? c : v;
    name += l.charAt(Math.floor(Math.random() * l.length) );
  }
  return name;
};

e.Point = class {
  constructor(point = {}) {
    this.x = point.x || 0;
    this.y = point.y || 0;
    this.name = (typeof point.name !== 'undefined'
                 ? point.name : e.randomName(3) );
  }

  sameAs(point) {
    return this.x === point.x
      && this.y === point.y
      && this.name === point.name;
  }
};

e.Set = class {
  constructor(domain = {x: [-1, 1], y: [-1, 1]}) {
    this.domain = domain;
    this.values = [];
  }

  addPoint(point = {}) {
    this.values.push(new e.Point(point));
    return this;
  }

  addRandom(number) {
    const extend = {  x: this.domain.x[1] - this.domain.x[0],
                      y: this.domain.y[1] - this.domain.y[0] };
    for(let i = 0; i < number; ++ i) {
      this.addPoint( { x: Math.random() * extend.x +  this.domain.x[0],
                       y: Math.random() * extend.y +  this.domain.y[0]} );
    }
    return this;
  }

};


module.exports = exports = e;
