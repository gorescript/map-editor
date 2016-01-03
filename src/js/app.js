var app = angular.module("map-editor", []);

import validate from "./common/validate";
app.directive("validate", validate);

import component from "./toolbox/toolbox";
app.component("toolbox", component);

app.config(() => {
});

app.run(() => {
	$(document).on("contextmenu", function(){
		return false;
	});
});