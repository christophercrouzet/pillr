const Queue = require('../queue');
const { sink } = require('../components');
const { dirExistsSync } = require('../utils');


const DEFAULT_OPTIONS = {
  sink: true,
  log: false,
};


module.exports = (destinationPath, options) => {
  const opts = Object.assign({}, DEFAULT_OPTIONS, options);
  if (!dirExistsSync(destinationPath)) {
    throw new Error(`${destinationPath}: No such destination directory`);
  }

  return new Queue()
    .append(
      'sink',
      sink(destinationPath, !opts.sink, opts.log)
    );
};
