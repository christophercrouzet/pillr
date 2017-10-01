const Queue = require('../queue');
const { StylePreprocessor } = require('../common');
const {
  minifyCSS,
  renderStyle,
  setPath,
  sink,
} = require('../components');
const { dirExistsSync } = require('../utils');


const DEFAULT_OPTIONS = {
  preprocessor: StylePreprocessor.CSS,
  minify: true,
  sink: true,
  log: false,
};


module.exports = (destinationPath, stylesPath, options) => {
  const opts = Object.assign({}, DEFAULT_OPTIONS, options);
  if (!dirExistsSync(destinationPath)) {
    throw new Error(`${destinationPath}: No such destination directory`);
  } else if (!dirExistsSync(stylesPath)) {
    throw new Error(`${stylesPath}: No such styles directory`);
  }

  return new Queue()
    .append(
      'renderStyle',
      renderStyle(stylesPath, opts.preprocessor)
    )
    .append(
      'minifyCSS',
      minifyCSS(!opts.minify)
    )
    .append(
      'setPath',
      setPath('.css')
    )
    .append(
      'sink',
      sink(destinationPath, !opts.sink, opts.log)
    );
};
