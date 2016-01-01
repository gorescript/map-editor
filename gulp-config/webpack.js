var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");
var webpackConfig = require("../webpack.config.js");

var devConfig = Object.create(webpackConfig);
devConfig.devtool = "sourcemap";
devConfig.debug = true;

var devCompiler = webpack(devConfig);

gulp.task("webpack", function(cb) {
	devCompiler.run(function(err, stats) {
		if (err) {
			throw new gutil.PluginError("webpack", err);
		}

		gutil.log("[webpack]", stats.toString({
			colors: true
		}));

		cb();
	});
});