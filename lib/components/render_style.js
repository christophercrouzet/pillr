const async = require('async');
const less = require('less');

const { StylePreprocessor } = require('../common');


// Process a single file.
function processFile(rootPath, preprocessor) {
  return (file, callback) => {
    if (preprocessor === StylePreprocessor.LESS) {
      const options = { paths: [rootPath], syncImport: true };
      less.render(file.data, options, (error, output) => {
        if (error) {
          console.error(`${file.path}: Could not render the LESS styles`);
          async.nextTick(callback, error);
          return;
        }

        const data = output.css;
        async.nextTick(callback, null, Object.assign({}, file, { data }));
      });
    } else {
      async.nextTick(callback, null, file);
    }
  };
}


// Render the CSS style.
module.exports = (rootPath, preprocessor) => {
  return (files, callback) => {
    async.map(
      files,
      processFile(rootPath, preprocessor),
      (error, results) => async.nextTick(callback, error, results)
    );
  };
};
