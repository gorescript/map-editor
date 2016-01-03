var app = angular.module("map-editor", []);

import validate from "./common/validate";
app.directive("validate", validate);

import toolbox from "./toolbox/toolbox";
app.directive("toolbox", toolbox);

import ToolboxController from "./toolbox/ToolboxController";
app.controller("ToolboxController", ToolboxController);

app.config(() => {
});

app.run(() => {
	$(document).on("contextmenu", function(){
		return false;
	});
});