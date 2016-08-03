angular.module('starter.services', ['forceng'])

	.factory('ForceService', function(force) {
		return {
			getAllContacts: function() {
				return force.query('select id, name, title from contact limit 50').then(
					function(data) {
						return data;
					}, function(error) {
						console.log('error occurred in ForceService.getAllContacts -->', error);
					}
				);
			}
		}
	});