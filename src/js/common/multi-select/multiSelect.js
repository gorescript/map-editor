import template from "./multi-select.html";

export default function multiSelect($compile, $timeout, $window) {
	return {
		restrict: "E",
		replace: true,
		template,
		scope: {
			buttonText: "=",
			items: "=",
			change: "&"
		},

		link: function(scope, elem, attrs) {
			scope.status = {
				isOpen: false
			};

			scope.select = (item) => {
				item._selected = !item._selected;

				if (scope.change) {
					scope.change();
				}
			};
		}
	};
}

multiSelect.$inject = ["$compile", "$timeout", "$window"];