const path = require('path');
const stream = require('stream');

const async = require('async');

const { WriteMode } = require('../common');
const { write } = require('../utils');


// Check if an object is a Node stream.
function isStream(obj) {
  return obj instanceof stream.Stream;
}


// Process a single file.
function processFile(rootPath, log) {
  return (file, callback) => {
    const filePath = path.join(rootPath, file.path);
    const writeMode = isStream(file.data) ? WriteMode.STREAM : WriteMode.UTF8;
    write(filePath, file.data, writeMode, (error) => {
      if (log === true && !error) {
        console.log(`Successfully wrote file '${file.path}'`);
      }

      async.nextTick(callback, error, file);
    });
  };
}


// Write files relatively to a given root directory.
module.exports = (rootPath, skip, log) => {
  return (files, callback) => {
    if (skip === true) {
      async.nextTick(callback, null, files);
      return;
    }

    async.map(
      files,
      processFile(rootPath, log),
      (error, results) => async.nextTick(callback, error, results)
    );
  };
};
