const fs = require('fs');
const path = require('path');

const async = require('async');

const { ReadMode } = require('../common');
const { read } = require('../utils');


// Add subdirectories to the given stack.
function populateStack(stack, rootPath, files, callback) {
  stack.unshift(...files
    .filter(file => file.stats.isDirectory())
    .map(file => path.join(rootPath, file.path)));
  async.nextTick(callback, null, files);
}


// Process a single stack item.
function processStackItem(out, stack, rootPath, userFilter, readMode) {
  // Initialize a new file object.
  const initFile = (dirPath) => {
    return (fileName, callback) => {
      const filePath = path.join(dirPath, fileName);
      fs.stat(filePath, (error, stats) => {
        async.nextTick(callback, error, {
          path: path.relative(rootPath, filePath),
          stats,
        });
      });
    };
  };

  // Filter supported files.
  const filterSupported = () => {
    return (file, callback) => {
      const keep = file.stats.isFile() || file.stats.isDirectory();
      async.nextTick(callback, null, keep);
    };
  };

  // Filter output files.
  const filterOutput = () => {
    return (file, callback) => {
      const keep = file.stats.isFile() && userFilter(file);
      async.nextTick(callback, null, keep);
    };
  };

  // Read a file's data.
  const readData = () => {
    return (file, callback) => {
      const filePath = path.join(rootPath, file.path);
      read(filePath, readMode, (error, data) => {
        async.nextTick(callback, error, Object.assign({}, file, { data }));
      });
    };
  };

  return (callback) => {
    const dirPath = stack.shift();
    async.waterfall([
      cb => fs.readdir(dirPath, cb),
      (fileNames, cb) => async.map(fileNames, initFile(dirPath), cb),
      (files, cb) => async.filter(files, filterSupported(), cb),
      (files, cb) => populateStack(stack, rootPath, files, cb),
      (files, cb) => async.filter(files, filterOutput(), cb),
      (files, cb) => async.map(files, readData(), cb),
    ], (error, result) => {
      if (error) {
        async.nextTick(callback, error);
        return;
      }

      out.push(...result);
      async.nextTick(callback, null);
    });
  };
}


// List and read the regular files within a directory hierarchy.
module.exports = (rootPath, filter, readMode = ReadMode.UTF8) => {
  return (callback) => {
    const out = [];
    const stack = [rootPath];
    async.whilst(
      () => stack.length,
      processStackItem(out, stack, rootPath, filter, readMode),
      error => async.nextTick(callback, error, out)
    );
  };
};
