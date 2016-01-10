import template from "./entity-tools.html";
import controller from "./EntityToolsController";

export default function entityTools($compile, $timeout, $window) {
	return {
		restrict: "E",
		require: ["^toolbox", "entityTools"],
		scope: {},
		bindToController: true,

		template,
		controller,
		controllerAs: "ctrl",

		link: function(scope, elem, attrs, ctrl) {
			var toolboxCtrl = ctrl[0];
			var entityToolsCtrl = ctrl[1];

			toolboxCtrl.onLayerToolInit(entityToolsCtrl.layer, entityToolsCtrl);
		}
	};
}

entityTools.$inject = ["$compile", "$timeout", "$window"];