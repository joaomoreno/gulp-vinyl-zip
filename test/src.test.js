'use strict';

var assert = require('assert');
var path = require('path');
var through = require('through2');
var temp = require('temp');
var vfs = require('vinyl-fs');
var lib = require('..');

describe('src', function () {
	it('should be able to read from archives', function (cb) {
		var count = 0;
		
		lib.src(path.join(__dirname, 'assets', 'small.zip'))
			.pipe(through.obj(function(chunk, enc, cb) {
				count++;
				cb();
			}, function () {
				assert.equal(2, count);
				cb();
			}));
	});
});
