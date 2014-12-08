'use strict';

var through = require('through2');
var AdmZip = require('adm-zip');
var File = require('../vinyl-zip');

function src(zipPath) {
	var stream = through.obj();
	var zip = new AdmZip(zipPath);
	
	var entries = zip.getEntries();
	var count = 0;
	
	entries.forEach(function (entry) {
		entry.getDataAsync(function (data) {
			stream.write(new File({
				path: entry.entryName,
				contents: entry.isDirectory ? null : data,
				attr: entry.header.attr,
				stat: {
					isDirectory: function () { return entry.isDirectory; }
				}
			}));
			
			if (++count === entries.length) {
				stream.end();
			}
		});
	});

	return stream;
}

module.exports = src;
