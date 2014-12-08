'use strict';

var through = require('through2');
var AdmZip = require('adm-zip');
var File = require('../vinyl-zip');

function dest(zipPath) {
	var zip = new AdmZip();
	
	var stream = through.obj(function (file, enc, cb) {
		if (file.contents) {
			zip.addFile(file.path, file.contents, '', file.attr);
		}
		cb();
	}, function (cb) {
		zip.writeZip(zipPath);
		cb();
	});
	
	stream.resume();
	return stream;
}

module.exports = dest;
