# Usage

## Archive → Archive

```javascript
var gulp = require('gulp');
var zip = require('gulp-vinyl-zip');

gulp.task('default', function () {
	return zip.src('src.zip')
		.pipe(/* knock yourself out */)
		.pipe(zip.dest('out.zip'));
});
```

## Archive → File System

```javascript
var gulp = require('gulp');
var zip = require('gulp-vinyl-zip');

gulp.task('default', function () {
	return zip.src('src.zip')
		.pipe(/* knock yourself out */)
		.pipe(gulp.dest('out'));
});
```

## File System → Archive

```javascript
var gulp = require('gulp');
var zip = require('gulp-vinyl-zip');

gulp.task('default', function () {
	return gulp.src('src/**/*')
		.pipe(/* knock yourself out */)
		.pipe(zip.dest('out.zip'));
});
```
