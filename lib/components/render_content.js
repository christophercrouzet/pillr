const assert = require('assert');

const async = require('async');
const MarkdownIt = require('markdown-it');
const markdownItAbbr = require('markdown-it-abbr');
const markdownItContainer = require('markdown-it-container');
const markdownItDefList = require('markdown-it-deflist');
const markdownItFootNote = require('markdown-it-footnote');
const markdownItMathJax = require('markdown-it-mathjax');
const markdownItSub = require('markdown-it-sub');
const markdownItSup = require('markdown-it-sup');


// Remove the footnote tokens from within a token list.
function popFootnoteTokens(tokens) {
  const from = tokens.findIndex(token => token.type === 'footnote_block_open');
  const to = tokens.findIndex(token => token.type === 'footnote_block_close');
  if (from === -1 || to === -1) {
    return [];
  }

  return tokens.splice(from, (to - from) + 1);
}


// Convert the footnote tokens into metadata.
function footnoteTokensToMeta(tokens, md) {
  return tokens
    .map((token, i) => { return token.type === 'footnote_open' ? i : -1; })
    .filter(i => i >= 0)
    .map((i) => {
      const inlineToken = tokens[i + 2];
      assert(inlineToken.type === 'inline');
      const anchorToken = tokens[i + 3];
      assert(anchorToken.type === 'footnote_anchor');

      const content = md.renderer.render([inlineToken], md.options, {});
      const id = anchorToken.meta.id + 1;
      const meta = Object.assign({}, anchorToken.meta, { id });
      return Object.assign({}, { content }, meta);
    });
}


// Process a single file.
function processFile(md) {
  return (file, callback) => {
    let content;
    let footnotes;
    try {
      const tokens = md.parse(file.meta.content, {});
      const footnoteTokens = popFootnoteTokens(tokens);
      footnotes = footnoteTokensToMeta(footnoteTokens, md);
      content = md.renderer.render(tokens, md.options, {});
    } catch (error) {
      console.error(`${file.path}: Could not render the content`);
      async.nextTick(callback, error);
      return;
    }

    const meta = Object.assign({}, file.meta, { content, footnotes });
    async.nextTick(callback, null, Object.assign({}, file, { meta }));
  };
}


// Render the metadata content's to HTML.
module.exports = (containerNames) => {
  const options = { html: true };
  const md = new MarkdownIt(options)
    .use(markdownItAbbr)
    .use(markdownItDefList)
    .use(markdownItFootNote)
    .use(markdownItSub)
    .use(markdownItSup)
    .use(markdownItMathJax());
  containerNames.forEach(name => md.use(markdownItContainer, name));
  return (files, callback) => {
    async.map(
      files,
      processFile(md),
      (error, results) => async.nextTick(callback, error, results)
    );
  };
};
