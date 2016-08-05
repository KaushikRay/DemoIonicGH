angular.module('starter.services', ['forceng'])

	.factory('ForceService', function(force) {
		return {
			getAllContacts: function() {
				return force.query('select id, name, title, MailingLatitude, MailingLongitude from contact limit 50').then(
					function(data) {
						console.log('contacrs service data -->', data);
						return data;
					}, function(error) {
						console.log('error occurred in ForceService.getAllContacts -->', error);
					}
				);
			},
			getAllContactsWithGeo: function() {
				return force.query(
					'select id, name, title, MailingLatitude, MailingLongitude from contact where MailingLatitude != null and MailingLongitude != null'
				).then(
					function(data) {
						console.log('data with all geo -->', data);
						return data;
					},
					function(error) {
						console.log('error occurred in ForceService.getAllContactsWithGeo -->', error);
					}
				);
			}
		}
	})

	.factory('GoogleMapService', function(force, $cordovaGeolocation) {
		return {
			getCurrentLocation: function() {
				var options = {timeout: 10000, enableHighAccuracy: true, zoom: 16};
				return $cordovaGeolocation.getCurrentPosition(options).then(
        			function(position) {
        				return position;
        			}, function(error) {
        				console.log('error occurred in GoogleMapService.getCurrentLocation -->', error);
        			}
    			);
			},
			calculateAndDisplayRoute: function(
				originPosition,
				destinationPosition,
				directionsService,
				directionsDisplay
			) {
				var currentLocation = this.getCurrentLocation().then(function(pos){return pos;});
				console.log('originPosition -->', originPosition);
				console.log('destinationPosition -->', destinationPosition);
				var request = {
				    origin: originPosition,
				    destination: destinationPosition,
				    travelMode: 'DRIVING'
				  };
			  	directionsService.route(request, function(result, status) {
				    if (status == 'OK') {
				      directionsDisplay.setDirections(result);
				    }
			  	});
			}
		}
	});