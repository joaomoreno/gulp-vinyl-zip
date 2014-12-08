'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var through = require('through2');
var temp = require('temp');
var vfs = require('vinyl-fs');
var rimraf = require('rimraf');
var lib = require('..');

describe('gulp-vinyl-zip', function () {
	it('src should be able to read from archives', function (cb) {
		var count = 0;
		
		lib.src(path.join(__dirname, 'assets', 'archive.zip'))
			.pipe(through.obj(function(chunk, enc, cb) {
				count++;
				cb();
			}, function () {
				assert.equal(7, count);
				cb();
			}));
	});
	
	it('dest should be able to create an archive from another archive', function (cb) {
		var dest = temp.openSync('gulp-vinyl-zip-test').path;
		
		lib.src(path.join(__dirname, 'assets', 'archive.zip'))
			.pipe(lib.dest(dest))
			.on('end', function () {
				assert(fs.existsSync(dest));
				rimraf.sync(dest);
				cb();
			});
	});
	
	it('should be compatible with vinyl-fs', function (cb) {
		var dest = temp.mkdirSync('gulp-vinyl-zip-test');
		
		lib.src(path.join(__dirname, 'assets', 'archive.zip'))
			.pipe(vfs.dest(dest))
			.on('end', function () {
				assert(fs.existsSync(dest));
				assert.equal(4, fs.readdirSync(dest).length);
				rimraf.sync(dest);
				cb();
			});
	});
	
	it('dest should preserve attr', function (cb) {
		var dest = temp.openSync('gulp-vinyl-zip-test').path;
		var attrs = Object.create(null);
		
		lib.src(path.join(__dirname, 'assets', 'archive.zip'))
			.pipe(through.obj(function (file, enc, cb) {
				assert(file.attr);
				attrs[file.path] = file.attr;
				cb(null, file);
			}, function (cb) {
				this.emit('end');
				cb();
			}))
			.pipe(lib.dest(dest))
			.on('end', function () {
				var count = 0;
				
				lib.src(dest)
					.pipe(through.obj(function (file, enc, cb) {
						count++;
						assert.equal(attrs[file.path], file.attr);
						cb();
					}, function () {
						assert.equal(7, count);
						rimraf.sync(dest);
						cb();
					}));
			});
	});
});
