var gulp = require("gulp");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat-util");

var vendorList = require("../vendor/_list");

gulp.task("vendor", function () {
	return gulp.src(vendorList)
		.pipe(concat("vendor.js", { sep: ";" }))
		.pipe(uglify({ mangle: false }))
		.pipe(gulp.dest(global.distFolder + "/js"));
});