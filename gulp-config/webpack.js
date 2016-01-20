var gulp = require("gulp");
var gutil = require("gulp-util");
var webpack = require("webpack");
var webpackConfig = require("../webpack.config.js");

var devConfig = Object.create(webpackConfig);
devConfig.devtool = "sourcemap";
devConfig.debug = true;

var devCompiler = webpack(devConfig);

gulp.task("webpack", function(cb) {
	runWebpack(devCompiler, cb);
});

gulp.task("webpack-prod", function(cb) {
	var config = Object.create(webpackConfig);

	config.plugins = config.plugins || [];
	config.plugins = config.plugins.concat(
		new webpack.optimize.UglifyJsPlugin({
			compress: false,
			sourceMap: false,
			mangle: false
		})
	);

	var prodCompiler = webpack(config);

	runWebpack(prodCompiler, cb);
});

function runWebpack(compiler, cb) {
	compiler.run(function(err, stats) {
		if (err) {
			throw new gutil.PluginError("webpack", err);
		}

		gutil.log("[webpack]", stats.toString({
			colors: true
		}));

		cb();
	});
}