# gulp-vinyl-yazl

A fork of [gulp-vinyl-zip](https://github.com/joaomoreno/gulp-vinyl-zip)
using [yazl](https://github.com/thejoshwolfe/yazl)
and [yauzl](https://github.com/thejoshwolfe/yauzl),
instead of [libarchive](https://github.com/joaomoreno/node-libarchive).

It can also transform multiple file streams into a single ZIP file stream.

## Usage

**Archive → Archive**

```javascript
var gulp = require('gulp');
var zip = require('gulp-vinyl-yazl');

gulp.task('default', function () {
	return zip.src('src.zip')
		.pipe(/* knock yourself out */)
		.pipe(zip.dest('out.zip'));
});
```

**Archive → File System**

```javascript
var gulp = require('gulp');
var zip = require('gulp-vinyl-yazl');

gulp.task('default', function () {
	return zip.src('src.zip')
		.pipe(/* knock yourself out */)
		.pipe(gulp.dest('out'));
});
```

**File System → Archive**

```javascript
var gulp = require('gulp');
var zip = require('gulp-vinyl-yazl');

gulp.task('default', function () {
	return gulp.src('src/**/*')
		.pipe(/* knock yourself out */)
		.pipe(zip.dest('out.zip'));
});
```

**File System → Archive Stream → Disk**

```javascript
var gulp = require('gulp');
var zip = require('gulp-vinyl-yazl').zip; // zip transform only

gulp.task('default', function () {
	return gulp.src('src/**/*')
		.pipe(/* knock yourself out */)
		.pipe(zip('out.zip')
		.pipe(/* knock your zip out */)
		.pipe(gulp.dest('./'));
});
```
