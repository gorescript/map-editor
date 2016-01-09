import template from "./zone-tools.html";
import controller from "./ZoneToolsController";

export default function zoneTools($compile, $timeout, $window) {
	return {
		restrict: "E",
		require: ["^toolbox", "zoneTools"],
		scope: {},
		bindToController: true,

		template,
		controller,
		controllerAs: "ctrl",

		link: function(scope, elem, attrs, ctrl) {
			var toolboxCtrl = ctrl[0];
			var zoneToolsCtrl = ctrl[1];

			toolboxCtrl.onLayerToolInit(zoneToolsCtrl.layer, zoneToolsCtrl);
		}
	};
}

zoneTools.$inject = ["$compile", "$timeout", "$window"];