const async = require('async');

const { defaultCallback } = require('./utils');


const InsertMode = {
  REGULAR: 0,
  REPLACE: 1,
};


// Find the index of a function.
function find(queue, name) {
  const out = queue.findIndex(e => e.name === name);
  if (out === -1) {
    throw new Error(`${name}: Could not find this function`);
  }

  return out;
}


// Insert a bunch of functions into a queue at a given index.
function insert(queue, index, fns, mode = InsertMode.REGULAR) {
  fns.forEach(({ fn, name }) => {
    if (queue.findIndex(e => e.name === name) !== -1) {
      throw new Error(`${name}: A function is already queued with this name`);
    } else if (typeof fn !== 'function') {
      throw new Error(`${name}: Not a valid function`);
    }
  });

  const deleteCount = mode === InsertMode.REPLACE ? 1 : 0;
  queue.splice(index, deleteCount, ...fns);
}


// Functions to be applied over a given input data in a waterfall fashion.
module.exports = class Queue {
  constructor() {
    this.data = [];
  }

  get(name) {
    return this.data.find(e => e.name === name);
  }

  insertBefore(targetName, name, fn) {
    const index = find(this.data, targetName);
    insert(this.data, index, [{ name, fn }]);
    return this;
  }

  insertAfter(targetName, name, fn) {
    const index = find(this.data, targetName);
    insert(this.data, index + 1, [{ name, fn }]);
    return this;
  }

  insertManyBefore(targetName, fns) {
    const index = find(this.data, targetName);
    insert(this.data, index, fns);
    return this;
  }

  insertManyAfter(targetName, fns) {
    const index = find(this.data, targetName);
    insert(this.data, index + 1, fns);
    return this;
  }

  append(name, fn) {
    insert(this.data, this.data.length, [{ name, fn }]);
    return this;
  }

  prepend(name, fn) {
    insert(this.data, 0, name, fn);
    return this;
  }

  replace(name, fn) {
    const index = find(this.data, name);
    insert(this.data, index, [{ name, fn }], InsertMode.REPLACE);
    return this;
  }

  remove(name) {
    const index = find(this.data, name);
    this.data.splice(index, 1);
    return this;
  }

  apply(data, callback = defaultCallback) {
    const fns = this.data.map(({ fn }) => fn);
    async.waterfall([async.constant(data), ...fns], callback);
  }
};
