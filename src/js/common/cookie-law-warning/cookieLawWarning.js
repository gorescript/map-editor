import template from "./cookie-law-warning.html";

var component = {
	template,
	controllerAs: "ctrl",

	controller: class CookieLawWarningController {
		constructor() {
			this.isVisible = window.localStorage.cookieLawOk === undefined;
		}

		close() {
			this.isVisible = false;
			window.localStorage.cookieLawOk = true;
		}
	}
}

export default component;