var gulp = require("gulp");
var less = require("gulp-less");
var lessImport = require("gulp-less-import");
var concat = require("gulp-concat-util");
var minify = require("gulp-minify-css");
var plumber = require("gulp-plumber");
var gutil = require("gulp-util");

gulp.task("less", function () {
	return gulp.src([
			"./vendor/less/**/*.less",
			"./src/**/*.less"
		])
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit("end");
		}))
		.pipe(lessImport("./src/less/variables.less"))
		.pipe(less())
		.pipe(concat("main.css"))
		.pipe(minify())
		.pipe(gulp.dest(global.distFolder + "/css"))
});