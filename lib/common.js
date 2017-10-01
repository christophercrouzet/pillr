const FrontMatter = {
  JSON: 0,
};

const StylePreprocessor = {
  NONE: 0,
  LESS: 1,
};

const ReadMode = {
  PASS: 0,
  UTF8: 1,
  BUFFER: 2,
  JSON: 3,
  MODULE: 4,
  STREAM: 5,
};

const WriteMode = {
  PASS: 0,
  UTF8: 1,
  STREAM: 2,
};

const Mapping = {
  DEFAULT: 0,
  DIR: 1,
  MODULE: 2,
};


module.exports = {
  FrontMatter,
  StylePreprocessor,
  ReadMode,
  WriteMode,
  Mapping,
};
