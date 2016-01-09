var gulp = require("gulp");

gulp.task("copy", function() {
	gulp.src([
			"./src/index.html"
		])
		.pipe(gulp.dest(global.distFolder));

	gulp.src(["./src/img/**/*"])
		.pipe(gulp.dest(global.distFolder + "/img"));

	gulp.src(["./src/fonts/**/*"])
		.pipe(gulp.dest(global.distFolder + "/fonts"));
});