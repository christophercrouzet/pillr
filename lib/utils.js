const fs = require('fs');
const path = require('path');

const async = require('async');

const { ReadMode, WriteMode, Mapping } = require('./common');


const PATH_SEP_RE = new RegExp(path.sep, 'g');


// Default callback to run upon completion of an async function.
function defaultCallback(error) {
  if (error) {
    console.error(error);
  }
}


// Remove the extension.
function trimExtension(filePath) {
  const ext = path.extname(filePath);
  return filePath.slice(0, filePath.length - ext.length);
}


// Map files data with their path as key.
function asDataMap(files, mapping, callback) {
  try {
    const out = files.reduce((obj, file) => {
      let key;
      switch (mapping) {
        case Mapping.DIR:
          key = path.dirname(file.path);
          break;
        case Mapping.MODULE:
          key = trimExtension(file.path).replace(PATH_SEP_RE, '.');
          break;
        default:
          key = file.path;
          break;
      }

      return Object.assign(obj, { [key]: file.data });
    }, {});
    async.nextTick(callback, null, out);
  } catch (error) {
    async.nextTick(callback, error);
  }
}


// Check if a directory exists.
function dirExistsSync(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (error) {
    return false;
  }
}


// Create a directory and any missing parent directory.
function mkdir(dirPath, callback) {
  // Credits: https://github.com/substack/node-mkdirp

  // Recursively go through the parents.
  const recurse = () => {
    mkdir(path.dirname(dirPath), (error) => {
      if (error) {
        async.nextTick(callback, error);
        return;
      }

      // Try again.
      mkdir(dirPath, callback);
    });
  };

  // Plan B for when things seem to go wrong.
  const fallBack = () => {
    fs.stat(dirPath, (error, stat) => {
      if (error || !stat.isDirectory()) {
        async.nextTick(
          callback,
          new Error(`${dirPath}: Could not create the directory`)
        );
        return;
      }

      async.nextTick(callback, null);
    });
  };

  fs.mkdir(dirPath, (error) => {
    if (!error) {
      async.nextTick(callback, null);
      return;
    }

    switch (error.code) {
      case 'ENOENT':
        recurse();
        break;
      default:
        fallBack();
        break;
    }
  });
}


// Read a file.
function read(filePath, mode, callback) {
  // Read a file using the module 'fs'.
  const readFile = (encoding, cb) => {
    fs.readFile(filePath, encoding, (error, data) => {
      if (error) {
        console.error(`${filePath}: Could not read the file`);
      }

      async.nextTick(cb, error, data);
    });
  };

  // Parse a JSON file data.
  const parseJSON = (data, cb) => {
    try {
      const parsedData = JSON.parse(data);
      async.nextTick(cb, null, parsedData);
    } catch (error) {
      console.error(`${filePath}: Could not parse the JSON data`);
      async.nextTick(cb, error);
    }
  };

  if (mode === ReadMode.UTF8) {
    readFile('utf8', (error, data) => {
      async.nextTick(callback, error, data);
    });
  } else if (mode === ReadMode.BUFFER) {
    readFile(null, (error, data) => {
      async.nextTick(callback, error, data);
    });
  } else if (mode === ReadMode.JSON) {
    async.waterfall([
      cb => readFile(null, cb),
      (data, cb) => parseJSON(data, cb),
    ], (error, result) => {
      async.nextTick(callback, error, result);
    });
  } else if (mode === ReadMode.MODULE) {
    try {
      const data = require(filePath);
      async.nextTick(callback, null, data);
    } catch (error) {
      console.error(`${filePath}: Could not require the module`);
      async.nextTick(callback, error);
    }
  } else if (mode === ReadMode.STREAM) {
    try {
      const data = fs.createReadStream(filePath);
      async.nextTick(callback, null, data);
    } catch (error) {
      console.error(`${filePath}: Could not create the read stream`);
      async.nextTick(callback, error);
    }
  }
}


// Write a file.
function write(filePath, data, mode, callback) {
  async.series([
    cb => mkdir(path.dirname(filePath), cb),
    (cb) => {
      if (mode === WriteMode.UTF8) {
        fs.writeFile(filePath, data, 'utf8', (error) => {
          if (error) {
            console.error(`${filePath}: Could not write the file`);
          }

          async.nextTick(cb, error);
        });
      } else if (mode === WriteMode.STREAM) {
        try {
          data.pipe(fs.createWriteStream(filePath));
          async.nextTick(cb, null);
        } catch (error) {
          console.error(`${filePath}: Could not create the write stream`);
          async.nextTick(cb, error);
        }
      }
    },
  ], error => async.nextTick(callback, error));
}


module.exports = {
  defaultCallback,
  trimExtension,
  asDataMap,
  dirExistsSync,
  mkdir,
  read,
  write,
};
