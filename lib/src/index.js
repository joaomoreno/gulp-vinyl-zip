'use strict';

var through = require('through2');
var archive = require('../../../node-libarchive/build/Release/archive');
var File = require('../vinyl-zip');

function src(zipPath) {
	var stream = through.obj();
	var count = 0;

	archive.read(zipPath, function (entry) {
		var stat = {
			isFile: function () { return entry.type === 'file'; },
			isDirectory: function () { return entry.type === 'directory'; },
			isBlockDevice: function () { return false; },
			isCharacterDevice: function () { return false; },
			isSymbolicLink: function () { return entry.type === 'symlink'; },
			isFIFO: function () { return false; },
			isSocket: function () { return false; }
		};

		if (entry.stat.permissions) {
			stat.mode = entry.stat.permissions;
		}

		if (entry.stat.atime) {
			stat.atime = new Date(entry.stat.atime);
		}

		if (entry.stat.ctime) {
			stat.ctime = new Date(entry.stat.ctime);
		}

		if (entry.stat.mtime) {
			stat.mtime = new Date(entry.stat.mtime);
		}

		var file ={
			path: entry.path,
			stat: stat
		};

		if (entry.type === 'file') {
			file.contents = entry.data;
		}

		if (entry.symlink) {
			file.symlink = entry.symlink;
		}

		stream.write(new File(file));
	}, function (err) {
		if (err) {
			stream.emit('error', err);
		} else {
			stream.end();
		}
	});

	return stream;
}

module.exports = src;
