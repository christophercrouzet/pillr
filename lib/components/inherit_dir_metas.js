const path = require('path');

const async = require('async');

const source = require('../source');
const { ReadMode, Mapping } = require('../common');
const { asDataMap } = require('../utils');


// Functor to generate a filter for metadata files.
function filter(dirMetaName) {
  return file => path.basename(file.path) === dirMetaName;
}


// Process a single file.
function processFile(dirMetas) {
  return (file, callback) => {
    const filePath = `.${path.sep}${file.path}`;
    const dirMeta = path.parse(filePath).dir.split(path.sep)
      .map((dirName, i, arr) => path.join(...arr.slice(0, i), dirName))
      .filter(dirPath => dirPath in dirMetas)
      .reduce((obj, dirPath) => Object.assign(obj, dirMetas[dirPath]), {});
    const meta = Object.assign({}, dirMeta, file.meta);
    async.nextTick(callback, null, Object.assign({}, file, { meta }));
  };
}


// Inherit the metadata from each directory ancestor.
module.exports = (sourcePath, dirMetaName) => {
  return (files, callback) => {
    async.waterfall([
      cb => source(sourcePath, filter(dirMetaName), ReadMode.JSON, cb),
      (metaFiles, cb) => asDataMap(metaFiles, Mapping.DIR, cb),
      (dirMetas, cb) => async.map(files, processFile(dirMetas), cb),
    ], (error, result) => {
      async.nextTick(callback, error, result);
    });
  };
};
