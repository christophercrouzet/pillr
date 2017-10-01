const path = require('path');

const async = require('async');
const mustache = require('mustache');

const loadTemplates = require('../load_templates');
const { ReadMode } = require('../common');
const { read } = require('../utils');


// Retrieve the template partials.
function getPartials(file, sourcePath, templates, customPartialName, callback) {
  const { partials } = templates;
  if (file.meta.customLayout === undefined) {
    async.nextTick(callback, null, partials);
    return;
  }

  const customLayoutPath = path.join(
    sourcePath,
    path.resolve(path.sep, file.meta.filePath.dir, file.meta.customLayout)
  );
  read(customLayoutPath, ReadMode.UTF8, (error, data) => {
    if (error) {
      console.error(`${file.path}: Could not load the custom layout`);
      async.nextTick(callback, error);
      return;
    }

    const customPartials = { [customPartialName]: data };
    async.nextTick(callback, null, Object.assign({}, partials, customPartials));
  });
}

// Render the page.
function render(file, layout, context, partials, callback) {
  try {
    const data = mustache.render(layout, context, partials);
    async.nextTick(callback, null, data);
  } catch (error) {
    console.error(`${file.path}: Could not render the layout`);
    async.nextTick(callback, error);
  }
}


// Wrap the template functions to pass them the current file.
function wrapFunctions(fns, file, files) {
  return Object.entries(fns)
    .reduce((obj1, [groupName, group]) => {
      return Object.assign(obj1, {
        [groupName]: Object.entries(group)
          .reduce((obj2, [fnName, fn]) => {
            return Object.assign(obj2, { [fnName]: fn(file, files) });
          }, {})
      });
    }, {});
}


// Process a single file.
function processFile(sourcePath, templates, customPartialName, files) {
  return (file, callback) => {
    const layout = templates.layouts[file.meta.layout];
    const fns = wrapFunctions(templates.fns, file, files);
    const context = Object.assign({}, file.meta, fns);
    async.waterfall([
      cb => getPartials(file, sourcePath, templates, customPartialName, cb),
      (partials, cb) => render(file, layout, context, partials, cb),
    ], (error, result) => {
      const data = result;
      async.nextTick(callback, error, Object.assign({}, file, { data }));
    });
  };
}


// Render the page's layout template to HTML.
module.exports = (sourcePath, templatesPath, customPartialName) => {
  return (files, callback) => {
    async.waterfall([
      cb => loadTemplates(templatesPath, cb),
      (templates, cb) => async.map(
        files,
        processFile(sourcePath, templates, customPartialName, files),
        cb
      ),
    ], (error, result) => {
      async.nextTick(callback, error, result);
    });
  };
};
