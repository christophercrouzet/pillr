const path = require('path');

const async = require('async');

const { trimExtension } = require('../utils');


// Process a single file.
function processFile() {
  return (file, callback) => {
    let parsed;
    if (file.meta !== undefined && file.meta.layout !== undefined) {
      const ext = path.extname(file.meta.layout);
      parsed = path.parse(`${trimExtension(file.path)}${ext}`);
    } else {
      parsed = path.parse(file.path);
    }

    const filePath = {
      dir: parsed.dir,
      name: parsed.name,
      ext: parsed.ext,
    };
    const meta = Object.assign({}, file.meta, { filePath });
    async.nextTick(callback, null, Object.assign({}, file, { meta }));
  };
}


// Parse the given file path field in a file's metadata.
module.exports = () => {
  return (files, callback) => {
    async.map(
      files,
      processFile(),
      (error, results) => async.nextTick(callback, error, results)
    );
  };
};
