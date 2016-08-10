angular.module('starter.controllers', ['starter.services', 'forceng'])

    .controller('AppCtrl', function ($scope, force) {

        $scope.logout = function() {
            force.logout();
        };

    })

    .controller('ContactListCtrl', function ($scope, force, ForceService) {
        ForceService.getAllContacts().then(
            function(data) {
                $scope.contacts = data.records;    
            }
        );

    })

    .controller('ContactCtrl', function ($scope, $stateParams, force) {

        force.retrieve('contact', $stateParams.contactId, 'id,name,title,phone,mobilephone,email').then(
            function (contact) {
                $scope.contact = contact;
            });


    })

    .controller('EditContactCtrl', function ($scope, $stateParams, $ionicNavBarDelegate, force) {

        force.retrieve('contact', $stateParams.contactId, 'id,firstname,lastname,title,phone,mobilephone,email').then(
            function (contact) {
                $scope.contact = contact;
            });

        $scope.save = function () {
            force.update('contact', $scope.contact).then(
                function (response) {
                    $ionicNavBarDelegate.back();
                },
                function() {
                    alert("An error has occurred.");
                });
        };

    })

    .controller('CreateContactCtrl', function ($scope, $stateParams, $ionicNavBarDelegate, force) {

        $scope.contact = {};

        $scope.save = function () {
            force.create('contact', $scope.contact).then(
                function (response) {
                    $ionicNavBarDelegate.back();
                },
                function() {
                    alert("An error has occurred.");
                });
        };

    })

    .controller('AccountListCtrl', function ($scope, force) {

        force.query('select id, name from account limit 50').then(
            function (data) {
                $scope.accounts = data.records;
            });

    })

    .controller('AccountCtrl', function ($scope, $stateParams, force) {

        force.retrieve('account', $stateParams.accountId, 'id,name,phone,billingaddress').then(
            function (account) {
                $scope.account = account;
            });

    })

    .controller('AccountMapCtrl', function ($scope, $stateParams, force, $ionicModal) {
        console.log('hello --->');
    })

    .controller('MyLocationCtrl', function(
        $scope,
        $stateParams,
        force,
        $cordovaGeolocation,
        $ionicModal,
        GoogleMapService,
        ForceService,
        $q
    ) {
        console.log('this is in my location page');
        var currentPosition = GoogleMapService.getCurrentLocation();

        var restaurantModal = $ionicModal.fromTemplateUrl('templates/bottom-sheet.html', {
          scope: $scope,
          viewType: 'bottom-sheet',
          animation: 'slide-in-up'
        });

        var allContacts = ForceService.getAllContactsWithGeo();
        var promises = [];
        promises.push(currentPosition);
        promises.push(allContacts);
        promises.push(restaurantModal);

        var allMarkers = [];
        var allContactDetails = [];
        var currentPositionLatLong;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var directionsService = new google.maps.DirectionsService;
        currentPosition.then(
          function(position) {
            console.log('position data -->', position);
            //var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var latLng = new google.maps.LatLng(52.50, 13.40);
            currentPositionLatLong = latLng;

            var mapOptions = {
              center: latLng,
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
            console.log('get bounds -->', $scope.map.getBounds());
            directionsDisplay.setMap($scope.map);
            //var bounds = new google.maps.LatLngBounds();
            var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
            var currentPositionMarker = new google.maps.Marker({
              map: $scope.map,
              animation: google.maps.Animation.DROP,
              position: latLng,
              id: 'currentPosition',
              icon: image
            });

            allContacts.then(
              function(contacts) {
                
                console.log('contacts final -->', contacts);
                for (var i=0; i<contacts.records.length; i++) {
                  var contact = contacts.records[i];
                  console.log('single contact -->', contact.MailingLatitude, contact.MailingLongitude);
                  var contactlatLng = new google.maps.LatLng(contact.MailingLatitude, contact.MailingLongitude);
                  var contactInfo = {};
                  var marker = new google.maps.Marker({
                    map: $scope.map,
                    animation: google.maps.Animation.DROP,
                    position: contactlatLng,
                    id: contact.Id
                  });

                  contactInfo.marker = marker;
                  contactInfo.recordDetails = contact;
                  contactInfo.currrentPosition = currentPositionMarker;
                  
                  allMarkers.push(marker);
                  allContactDetails.push(contactInfo);

                  // Set boundary for markers in map
                  //bounds.extend(contactlatLng);
                }
                var options = {
                    imagePath: 'images/m'
                };

                var markerCluster = new MarkerClusterer($scope.map, allMarkers, options);
                google.maps.event.addListener($scope.map, 'idle', function() {
                  console.log('North East -->', $scope.map.getBounds().getNorthEast().lat());
                  console.log('South West -->', $scope.map.getBounds().getSouthWest().lat());
                });

                // Fit map based on markers
                //$scope.map.fitBounds(bounds);
              }

            );
            
          }, 
          function(error) {
            console.log("Could not get location" + error);
          }
        );

        // Add listener for marker pop up once all promises resolved
        $q.all(promises).then(
          function(values) {
            // console.log('first -->', values[0]);
            // console.log('second -->', values[1]);
            // console.log('third -->', values[2]);
            var detailModal = values[2];

            $scope.modal = detailModal;
            for (var i=0; i<allContactDetails.length; i++) {
              console.log('initial all contact details -->', allContactDetails[i]);
              with ({contactInfoVal : allContactDetails[i]}) {
                google.maps.event.addListener(contactInfoVal.marker, 'click', function() {
                  console.log('inside final contact info -->', contactInfoVal.currentPosition);
                  $scope.contactName = contactInfoVal.recordDetails.Name;
                  detailModal.show();
                  GoogleMapService.calculateAndDisplayRoute(
                    currentPositionLatLong,
                    contactInfoVal.marker.getPosition(),
                    directionsService,
                    directionsDisplay
                  );
                });
              }
            }
        });

    })


  .directive('ionBottomSheet', [function() {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      controller: [function() {}],
      template: '<div class="modal-wrapper" ng-transclude></div>'  
    };
  }])
  .directive('ionBottomSheetView', function() {
    return {
      restrict: 'E',
      compile: function(element) {
        element.addClass('bottom-sheet modal');
      }
    };
  });
