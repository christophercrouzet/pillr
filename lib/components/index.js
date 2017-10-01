const inheritDirMetas = require('./inherit_dir_metas');
const minifyCSS = require('./minify_css');
const minifyHTML = require('./minify_html');
const parseFilePath = require('./parse_file_path');
const parsePage = require('./parse_page');
const renderContent = require('./render_content');
const renderPage = require('./render_page');
const renderStyle = require('./render_style');
const setPath = require('./set_path');
const sink = require('./sink');
const source = require('./source');


module.exports = {
  inheritDirMetas,
  minifyCSS,
  minifyHTML,
  parseFilePath,
  parsePage,
  renderContent,
  renderPage,
  renderStyle,
  setPath,
  sink,
  source,
};
