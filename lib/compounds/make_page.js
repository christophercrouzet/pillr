const Queue = require('../queue');
const { FrontMatter } = require('../common');
const { dirExistsSync } = require('../utils');
const {
  inheritDirMetas,
  minifyHTML,
  parseFilePath,
  parsePage,
  renderContent,
  renderPage,
  setPath,
  sink,
} = require('../components');


const DEFAULT_OPTIONS = {
  dirMetaName: 'pillr.json',
  frontMatter: FrontMatter.JSON,
  containerNames: [],
  customPartialName: '_custom',
  minify: true,
  sink: true,
  log: false,
};


module.exports = (sourcePath, destinationPath, templatesPath, options) => {
  const opts = Object.assign({}, DEFAULT_OPTIONS, options);
  if (!dirExistsSync(sourcePath)) {
    throw new Error(`${sourcePath}: No such source directory`);
  } else if (!dirExistsSync(destinationPath)) {
    throw new Error(`${destinationPath}: No such destination directory`);
  } else if (!dirExistsSync(templatesPath)) {
    throw new Error(`${templatesPath}: No such templates directory`);
  }

  return new Queue()
    .append(
      'parsePage',
      parsePage(opts.frontMatter)
    )
    .append(
      'inheritDirMetas',
      inheritDirMetas(sourcePath, opts.dirMetaName)
    )
    .append(
      'parseFilePath',
      parseFilePath()
    )
    .append(
      'renderContent',
      renderContent(opts.containerNames)
    )
    .append(
      'renderPage',
      renderPage(sourcePath, templatesPath, opts.customPartialName)
    )
    .append(
      'minifyHTML',
      minifyHTML(!opts.minify)
    )
    .append(
      'setPath',
      setPath()
    )
    .append(
      'sink',
      sink(destinationPath, !opts.sink, opts.log)
    );
};
