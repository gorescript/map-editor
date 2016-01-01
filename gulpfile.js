var gulp = require("gulp");
var runSequence = require("run-sequence");
var requireDir = require("require-dir");

requireDir("./gulp-config");

global.distFolder = "./dist";

gulp.task("default", function() {
	run();

	gulp.watch([
		"./src/js/**/*.html",
		"./src/index.html",
		"./src/img/**/*",
		"./src/fonts/**/*"
		], ["copy"]);

	gulp.watch(["./src/**/*.less"], ["less"]);
	gulp.watch(["./src/js/**/*.js"], ["webpack"]);
});

function run() {
	runSequence("clean", "copy", "vendor", "webpack", "less");
}