export default function booleanField($compile, $timeout, $window) {
	return {
		restrict: "E",
		replace: true,
		template: `
			<div class="btn-group boolean-field">
				<label class="btn btn-primary" ng-model="model" uib-btn-radio="true">Yes</label>
				<label class="btn btn-primary" ng-model="model" uib-btn-radio="false">No</label>
			</div>
		`,
		scope: {
			model: "=ngModel"
		},

		link: function(scope, elem, attrs, ngModel) {
		}
	};
}

booleanField.$inject = ["$compile", "$timeout", "$window"];