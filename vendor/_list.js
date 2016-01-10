var files = [
	"jquery.min",
	"jszip.min",
	"three.min",
	"polyk",
	"angular.min"
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