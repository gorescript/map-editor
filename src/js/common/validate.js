export default function validate($compile, $timeout, $window) {
	return {
		restrict: "A",
		require: "ngModel",
		scope: {
			validate: "&"
		},

		link: function(scope, elem, attrs, ngModel) {
			ngModel.$options = {
				updateOn: "blur"
			};

			ngModel.$parsers.unshift((viewValue) => {
				var result = scope.validate({ value: viewValue });

				if (result) {
					ngModel.$setViewValue(result.value);
					ngModel.$render();
					return result.value;
				} else {
					ngModel.$setViewValue(ngModel.$modelValue);
					ngModel.$render();
					return ngModel.$modelValue;
				}
			});

			elem.on("keyup", (e) => {
				if (e.keyCode === 13) {
					ngModel.$commitViewValue();
				}
			});
		}
	};
}

validate.$inject = ["$compile", "$timeout", "$window"];