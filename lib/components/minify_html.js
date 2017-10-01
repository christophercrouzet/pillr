const async = require('async');
const htmlMinifier = require('html-minifier');


// Process a single file.
function processFile() {
  const options = { collapseWhitespace: true };
  return (file, callback) => {
    if (file.meta.filePath.ext !== '.html') {
      async.nextTick(callback, null, file);
      return;
    }

    const data = htmlMinifier.minify(file.data, options);
    async.nextTick(callback, null, Object.assign({}, file, { data }));
  };
}


// Minify HTML.
module.exports = (skip) => {
  return (files, callback) => {
    if (skip === true) {
      async.nextTick(callback, null, files);
      return;
    }

    async.map(
      files,
      processFile(),
      (error, results) => async.nextTick(callback, error, results)
    );
  };
};
