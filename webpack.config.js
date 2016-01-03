module.exports = {
	entry: "./src/js/app.js",

	output: {
		path: "./dist/js",
		filename: "client.js"
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				query: {
					presets: ["es2015"]
				}
			},
			{
				test: /\.html$/,
				loader: "html-loader"
			}
		]
	},

	resolve: {
		extensions: ["", ".js"]
	}
};