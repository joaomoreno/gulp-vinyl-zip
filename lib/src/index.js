'use strict';

var fs = require('fs');
var cnst = process.binding('constants');
var yauzl = require('yauzl');
var through = require('through2');
var File = require('../vinyl-zip');
var queue = require('queue');

function modeFromEntry(entry) {
	var attr = entry.externalFileAttributes >> 16 || 33188;

	return [cnst.S_IRWXU, cnst.S_IRWXG, cnst.S_IRWXO]
		.map(function(mask) { return attr & mask; })
		.reduce(function(a, b) { return a + b; }, attr & cnst.S_IFMT);
}

function mtimeFromEntry(entry) {
	return yauzl.dosDateTimeToDate(entry.lastModFileDate, entry.lastModFileTime);
}

function src(zipPath) {
	var stream = through.obj();

	yauzl.open(zipPath, function (err, zip) {
		if (err) {
			return stream.emit('error', err);
		}

		var q = queue();
		var didErr = false;

		q.on('error', function (err) {
			didErr = true;
			stream.emit('error', err);
		});

		zip.on('entry', function (entry) {
			if (didErr) { return; }

			var stat = new fs.Stats();
			stat.mode = modeFromEntry(entry);
			stat.mtime = mtimeFromEntry(entry);

			var file = {
				path: entry.fileName,
				stat: stat
			};

			if (stat.isFile()) {
				q.push(function (cb) {
					zip.openReadStream(entry, function(err, readStream) {
				    if (err) { return cb(err); }

						file.contents = readStream;
						stream.write(new File(file));
						cb();
				  });
				});
				
				q.start();

			} else if (stat.isSymbolicLink()) {
				q.push(function (cb) {
					zip.openReadStream(entry, function(err, readStream) {
				    if (err) { return cb(err); }

						file.symlink = '';
						readStream.on('data', function(c) { file.symlink += c });
						readStream.on('error', cb);
						readStream.on('end', function () {
							stream.write(new File(file));
							cb();
						});
				  });
				});

				q.start();

			} else {
				stream.write(new File(file));
			}
		});

		zip.on('end', function() {
			if (didErr) {
				return;
			}

			if (q.length === 0) {
				stream.end();
			} else {
				q.on('end', function () {
					stream.end();
				});
			}
		});
	});

	return stream;
}

module.exports = src;
