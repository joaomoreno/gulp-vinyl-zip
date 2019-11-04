'use strict';

var fs = require('fs');
var yauzl = require('yauzl');
var es = require('event-stream');
var File = require('../vinyl-zip');
var queue = require('queue');
var constants = require('constants');
var through = require('through2');

function modeFromEntry(entry) {
	var attr = entry.externalFileAttributes >> 16 || 33188;

	return [448 /* S_IRWXU */, 56 /* S_IRWXG */, 7 /* S_IRWXO */]
		.map(function(mask) { return attr & mask; })
		.reduce(function(a, b) { return a + b; }, attr & 61440 /* S_IFMT */);
}

function mtimeFromEntry(entry) {
	return yauzl.dosDateTimeToDate(entry.lastModFileDate, entry.lastModFileTime);
}

function toStream(zip) {
	var result = es.through();
	var q = queue();
	var didErr = false;

	q.on('error', function (err) {
		didErr = true;
		result.emit('error', err);
	});

	zip.on('entry', function (entry) {
		if (didErr) { return; }

		var stat = new fs.Stats();
		stat.mode = modeFromEntry(entry);
		stat.mtime = mtimeFromEntry(entry);

		// directories
		if (/\/$/.test(entry.fileName)) {
			stat.mode = (stat.mode & ~constants.S_IFMT) | constants.S_IFDIR;
		}

		var file = {
			path: entry.fileName,
			stat: stat
		};

		if (stat.isFile()) {
			if (entry.uncompressedSize === 0) {
				file.contents = Buffer.alloc(0);
				result.emit('data', new File(file));

			} else {
				q.push(function (cb) {
					zip.openReadStream(entry, function(err, readStream) {
					if (err) { return cb(err); }

						file.contents = readStream;
						result.emit('data', new File(file));
						cb();
					});
				});

				q.start();
			}

		} else if (stat.isSymbolicLink()) {
			q.push(function (cb) {
				zip.openReadStream(entry, function(err, readStream) {
				if (err) { return cb(err); }

					file.symlink = '';
					readStream.on('data', function(c) { file.symlink += c; });
					readStream.on('error', cb);
					readStream.on('end', function () {
						result.emit('data', new File(file));
						cb();
					});
				});
			});

			q.start();

		} else if (stat.isDirectory()) {
			file.contents = null;
			result.emit('data', new File(file));

		} else {
			result.emit('data', new File(file));
		}
	});

	zip.on('end', function() {
		if (didErr) {
			return;
		}

		if (q.length === 0) {
			result.end();
		} else {
			q.on('end', function () {
				result.end();
			});
		}
	});

	return result;
}

function unzipFile(zipPath) {
	var result = es.through();
	yauzl.open(zipPath, function (err, zip) {
		if (err) { return result.emit('error', err); }
		toStream(zip).pipe(result);
	});
	return result;
}

function unzip() {
	return through.obj(function (file, enc, next) {
		if (!file.isBuffer()) return next(new Error('Only supports buffers'));
		yauzl.fromBuffer(file.contents, (err, zip) => {
			if (err) {
				this.emit('error', err)
			} else {
				toStream(zip)
					.on('error', next)
					.on('data', (data) => this.push(data))
					.on('end', next)
			}
		});
	});
}

function src(zipPath) {
	return zipPath ? unzipFile(zipPath) : unzip();
}

module.exports = src;
