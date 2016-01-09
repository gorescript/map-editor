var app = angular.module("map-editor", []);

import validate from "./common/validate";
app.directive("validate", validate);

import zoneTools from "./toolbox/zone-tools/zoneTools";
app.directive("zoneTools", zoneTools);

import toolbox from "./toolbox/toolbox";
app.component("toolbox", toolbox);

app.config(() => {
});

app.run(() => {
	$(document).on("contextmenu", function(){
		return false;
	});
});