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

    if (file.stat.isSymbolicLink && file.stat.isSymbolicLink()) {
      zip.addBuffer(new Buffer(file.symlink), file.relative, opts);
    } else if (file.isDirectory()) {
      zip.addEmptyDirectory(file.relative, opts);
    } else if (file.isBuffer()) {
      zip.addBuffer(file.contents, file.relative, opts);
    } else if (file.isStream()) {
      zip.addReadStream(file.contents, file.relative, opts);
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
