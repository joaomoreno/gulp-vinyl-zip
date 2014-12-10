'use strict';

var through = require('through2');
var archive = require('../../../node-libarchive/build/Release/archive');
var File = require('../vinyl-zip');

function dest(zipPath) {
	var zip = new archive.Writer(zipPath);
	
	var stream = through.obj(function (file, enc, cb) {
		var stat = {};

		if (file.stat.mode) {
			stat.permissions = file.stat.mode;
		}

		if (file.stat.atime) {
			stat.atime = file.stat.atime;
		}

		if (file.stat.ctime) {
			stat.ctime = file.stat.ctime;
		}

		if (file.stat.mtime) {
			stat.mtime = file.stat.mtime;
		}

		if (file.isDirectory()) {
			zip.writeDirectory(file.path, stat, cb);
		} else if (file.contents) {
			zip.writeFile(file.path, file.contents, stat, cb);
		} else if (file.symlink) {
			zip.writeSymlink(file.path, file.symlink, stat, cb);
		} else {
			cb();
		}
	}, function (cb) {
		zip.close(cb);
	});
	
	stream.resume();
	return stream;
}

module.exports = dest;
