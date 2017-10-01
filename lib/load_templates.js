const path = require('path');

const async = require('async');

const source = require('./source');
const { ReadMode, Mapping } = require('./common');
const { asDataMap } = require('./utils');


// Pass-through function.
function pass(e) {
  return e;
}


// Filter function files.
function fnsFilter(file) {
  return path.extname(file.path) === '.js';
}


// Load a single template.
function loadTemplate(template, name, callback) {
  async.waterfall([
    cb => source(template.path, template.filter, template.readMode, cb),
    (files, cb) => asDataMap(files, template.mapping, cb),
  ], (error, result) => {
    async.nextTick(callback, error, result);
  });
}


// Load the template data to use with Mustache.
module.exports = (dirPath, callback) => {
  async.mapValues({
    fns: {
      path: path.join(dirPath, 'functions'),
      filter: fnsFilter,
      readMode: ReadMode.MODULE,
      mapping: Mapping.MODULE,
    },
    layouts: {
      path: path.join(dirPath, 'layouts'),
      filter: pass,
      readMode: ReadMode.UTF8,
      mapping: Mapping.DEFAULT,
    },
    partials: {
      path: path.join(dirPath, 'partials'),
      filter: pass,
      readMode: ReadMode.UTF8,
      mapping: Mapping.DEFAULT,
    },
  }, loadTemplate, (error, results) => {
    async.nextTick(callback, error, results);
  });
};
