# Usage

```javascript
	var gulp = require('gulp');
	var zip = require('gulp-vinyl-zip');

	gulp.task('default', function () {
		return zip.src('src.zip')
			.pipe(/* knock yourself out */)
			.pipe(zip.dest(dest));
	});
```
