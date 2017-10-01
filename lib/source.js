const source = require('./components/source');


module.exports = (rootPath, filter, readMode, callback) => {
  source(rootPath, filter, readMode)(callback);
};
