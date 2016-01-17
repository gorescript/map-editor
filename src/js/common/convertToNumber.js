export default function convertToNumber($compile, $timeout, $window) {
	return {
		restrict: "A",
		require: "ngModel",

		link: function(scope, elem, attrs, ngModel) {
			ngModel.$parsers.push(function(val) {
				return parseInt(val, 10);
			});

			ngModel.$formatters.push(function(val) {
				return "" + val;
			});
		}
	};
}

convertToNumber.$inject = ["$compile", "$timeout", "$window"];