'use strict';

var File = require('vinyl');
var util = require('util');

function ZipFile(file) {
	File.call(this, file);
	
	this.attr = file.attr || null;
}

util.inherits(ZipFile, File);

module.exports = ZipFile;
