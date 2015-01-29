'use strict';

var fs = require('fs');
var cnst = process.binding('constants');
var yauzl = require('yauzl');
var dosDate = yauzl.dosDateTimeToDate;
var through = require('through2');
var File = require('../vinyl-zip');

function src(zipPath) {
	var zipEnded, stream = through.obj();

	yauzl.open(zipPath, function (err, zip) {
		if (err) return stream.emit('error', err);
		zip.on('entry', function (entry) {
			var attr = entry.externalFileAttributes >> 16;

			var stat = new fs.Stats();
			stat.mode = [cnst.S_IRWXU, cnst.S_IRWXG, cnst.S_IRWXO]
								  .map(function(mask) { return attr & mask; })
								  .reduce(function(a, b) { return a + b; }, attr & cnst.S_IFMT);
			stat.ctime =
			stat.atime =
			stat.mtime = dosDate(entry.lastModFileDate, entry.lastModFileTime);

			var file = {
				path: entry.fileName,
				stat: stat
			};

			var done = function() {
				stream.write(new File(file));
				if (zipEnded) {
					stream.end();
				}
			};

			if (stat.isFile() || stat.isSymbolicLink()) {
				zip.openReadStream(entry, function(err, readStream) {
			    if (err) return stream.emit('error', err);

					if (stat.isFile()) {
						file.contents = readStream;
						done();
					} else {
						file.symlink = '';
						readStream.on('data', function(c) { file.symlink += c });
						readStream.on('end', done);
					}
			  });
			} else {
				done();
			}
		});

		zip.on('end', function() {
			zipEnded = true;
		});
	});

	return stream;
}

module.exports = src;
