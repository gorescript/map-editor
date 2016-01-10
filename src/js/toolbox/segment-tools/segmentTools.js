import template from "./segment-tools.html";
import controller from "./SegmentToolsController";

export default function segmentTools($compile, $timeout, $window) {
	return {
		restrict: "E",
		require: ["^toolbox", "segmentTools"],
		scope: {},
		bindToController: true,

		template,
		controller,
		controllerAs: "ctrl",

		link: function(scope, elem, attrs, ctrl) {
			var toolboxCtrl = ctrl[0];
			var segmentToolsCtrl = ctrl[1];

			toolboxCtrl.onLayerToolInit(segmentToolsCtrl.layer, segmentToolsCtrl);
		}
	};
}

segmentTools.$inject = ["$compile", "$timeout", "$window"];