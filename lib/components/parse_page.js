const async = require('async');

const { FrontMatter } = require('../common');


const FRONT_MATTER_DELIMITER_RE = {
  [FrontMatter.JSON]: /^;;;$/m,
};


// Parse the front matter.
function parseFronMatter(data, frontMatter) {
  if (frontMatter === FrontMatter.JSON) {
    return JSON.parse(data);
  }

  return {};
}


// Process a single file.
function processFile(frontMatter) {
  return (file, callback) => {
    let meta = {};
    let content = file.data;
    const match = content.match(FRONT_MATTER_DELIMITER_RE[frontMatter]);
    if (match !== null) {
      try {
        meta = parseFronMatter(content.slice(0, match.index), frontMatter);
      } catch (error) {
        console.error(`${file.path}: Invalid front matter`);
        async.nextTick(callback, error);
        return;
      }
      content = content.slice(match.index + match[0].length);
    }

    meta.content = content;
    async.nextTick(callback, null, Object.assign({}, file, { meta }));
  };
}


// Parse the front matter and the content of a page.
module.exports = (frontMatter) => {
  if (frontMatter !== FrontMatter.JSON) {
    throw new Error('Unsupported front matter format');
  }

  return (files, callback) => {
    async.map(
      files,
      processFile(frontMatter),
      (error, results) => async.nextTick(callback, error, results)
    );
  };
};
