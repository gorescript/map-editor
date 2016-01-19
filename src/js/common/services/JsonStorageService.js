export default class JsonStorageService {
	constructor($http, $q) {
		this.$http = $http;
		this.$q = $q;

		this.rootUrl = "https://api.myjson.com";
	}

	get(id) {
		var deferred = this.$q.defer();

		var request = this.$http({
			url: this.rootUrl + "/bins/" + id
		});

		request
			.success((data) => {
				deferred.resolve(data);
			})
			.error(() => {
				deferred.reject();
			});

		return deferred.promise;
	}

	add(json) {
		var deferred = this.$q.defer();

		var request = this.$http({
			url: this.rootUrl + "/bins",
			method: "post",
			data: json
		});

		request
			.success((data) => {
				var id = data.uri.split("/").pop();
				deferred.resolve(id);
			})
			.error(() => {
				deferred.reject();
			});

		return deferred.promise;
	}

	update(id, json) {
		var deferred = this.$q.defer();

		var request = this.$http({
			url: this.rootUrl + "/bins/" + id,
			method: "put",
			data: json
		});

		request
			.success((data) => {
				deferred.resolve();
			})
			.error(() => {
				deferred.reject();
			});

		return deferred.promise;
	}
}

JsonStorageService.$inject = ["$http", "$q"];