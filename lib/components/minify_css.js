const async = require('async');
const csso = require('csso');


// Process a single file.
function processFile() {
  const options = {};
  return (file, callback) => {
    const data = csso.minify(file.data, options).css;
    async.nextTick(callback, null, Object.assign({}, file, { data }));
  };
}


// Minify CSS.
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
