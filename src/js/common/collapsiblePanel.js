export default function collapsiblePanel($compile, $timeout, $window) {
	return {
		restrict: "A",

		link: function(scope, elem, attrs) {
			var collapsed = attrs.collapsed !== undefined;
			var cssClass = collapsed ? "fa-plus" : "fa-minus";

			var widget = $(`<i class="fa ${cssClass}" style="margin-right: 5px"></i>`);

			var panelHeading = $(".panel-heading", elem);
			var panelBody = $(".panel-body", elem);

			applyCollapsed();

			panelHeading.prepend(widget);
			panelHeading.on("click", () => {
				collapsed = !collapsed;
				applyCollapsed();
			});

			function applyCollapsed() {
				if (collapsed) {
					panelHeading.addClass("collapsed");
					widget.removeClass("fa-minus");
					widget.addClass("fa-plus");
					panelBody.hide();
				} else {
					panelHeading.removeClass("collapsed");
					widget.removeClass("fa-plus");
					widget.addClass("fa-minus");
					panelBody.show();
				}
			}
		}
	};
}

collapsiblePanel.$inject = ["$compile", "$timeout", "$window"];