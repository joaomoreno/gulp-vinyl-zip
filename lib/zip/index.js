'use strict';

var through = require('through2');
var yazl = require('yazl');
var File = require('../vinyl-zip');

function zip(zipPath) {
  if (!zipPath) throw new Error('No zip path specified.');

  var zip = new yazl.ZipFile();
  var output = through.obj();

  var stream = through.obj(function(file, enc, cb) {
    var stat = file.stat || {};

    var opts = {
      mtime: stat.mtime,
      mode: stat.mode
    };

    var path = file.relative.replace(/\\/g, '/');

    if (file.stat.isSymbolicLink && file.stat.isSymbolicLink()) {
      zip.addBuffer(new Buffer(file.symlink), path, opts);
    } else if (file.isDirectory()) {
      zip.addEmptyDirectory(path, opts);
    } else if (file.isBuffer()) {
      zip.addBuffer(file.contents, path, opts);
    } else if (file.isStream()) {
      zip.addReadStream(file.contents, path, opts);
    }
    
    cb();
  }, function(cb) {
    stream.push(new File({path: zipPath, contents: zip.outputStream}));
    zip.end(function(size) {
      cb();
    });
  });

  stream.resume();
  return stream;
}

module.exports = zip;
