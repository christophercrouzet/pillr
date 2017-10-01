const path = require('path');

const async = require('async');

const { trimExtension } = require('../utils');


// Process a single file.
function processFile(extension) {
  return (file, callback) => {
    let filePath;
    if (file.meta !== undefined && file.meta.filePath !== undefined) {
      const ext = extension === null
        ? file.meta.filePath.ext
        : extension;
      filePath = path.format(Object.assign({}, file.meta.filePath, { ext }));
    } else {
      filePath = extension === undefined
        ? file.path
        : `${trimExtension(file.path)}${extension}`;
    }

    async.nextTick(callback, null, Object.assign({}, file, { path: filePath }));
  };
}


// Set the file's path.
module.exports = (extension = null) => {
  return (files, callback) => {
    async.map(
      files,
      processFile(extension),
      (error, results) => async.nextTick(callback, error, results)
    );
  };
};
