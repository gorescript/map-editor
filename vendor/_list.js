var files = [
	"jquery.min",
	"jquery-ui.min",
	"jszip.min",
	"three.min",
	"polyk"
];

files = files.map(function(item) {
	return "./vendor/" + item + ".js";
});

var gorescriptFiles = [
	"Base",
	"Extensions",
	"InputHelper",
	"MathHelper",
	"MapEnums",
	"LineHelper",
	"PolygonHelper"
];

gorescriptFiles = gorescriptFiles.map(function(item) {
	return "./node_modules/gorescript/src/common/" + item + ".js";
});

Array.prototype.push.apply(files, gorescriptFiles);

module.exports = files;