import template from "./sector-tools.html";
import controller from "./SectorToolsController";

export default function sectorTools($compile, $timeout, $window) {
	return {
		restrict: "E",
		require: ["^toolbox", "sectorTools"],
		scope: {},
		bindToController: true,

		template,
		controller,
		controllerAs: "ctrl",

		link: function(scope, elem, attrs, ctrl) {
			var toolboxCtrl = ctrl[0];
			var sectorToolsCtrl = ctrl[1];

			toolboxCtrl.onLayerToolInit(sectorToolsCtrl.layer, sectorToolsCtrl);
		}
	};
}

sectorTools.$inject = ["$compile", "$timeout", "$window"];