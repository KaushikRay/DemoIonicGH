angular.module('starter.controllers', ['forceng'])

    .controller('AppCtrl', function ($scope, force) {

        $scope.logout = function() {
            force.logout();
        };

    })

    .controller('ContactListCtrl', function ($scope, force) {

        force.query('select id, name, title from contact limit 50').then(
            function (data) {
                $scope.contacts = data.records;
            },
            function (error) {
                alert("Error Retrieving Contacts");
                console.log(error);
            });

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

    .controller('MyLocationCtrl', function($scope, $stateParams, force, $cordovaGeolocation, $ionicModal) {
        console.log('this is in my location page');
        var options = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            var mapOptions = {
              center: latLng,
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

            //Wait until the map is loaded
            google.maps.event.addListenerOnce($scope.map, 'idle', function(){
             
              var marker = new google.maps.Marker({
                  map: $scope.map,
                  animation: google.maps.Animation.DROP,
                  position: latLng
              });

              $scope.contacts = [
                { name: 'Gordon Freeman' },
                { name: 'Barney Calhoun' },
                { name: 'Lamarr the Headcrab' },
              ];

              // $ionicModal.fromTemplateUrl('templates/modal.html', {
              //   scope: $scope
              // }).then(function(modal) {
              //   $scope.modal = modal;
              //   marker.addListener('click', function() {
              //     console.log('helllos from marker');
              //     modal.show();
              //   });
              // });
              $ionicModal.fromTemplateUrl('templates/bottom-sheet.html', {
                scope: $scope,
                viewType: 'bottom-sheet',
                animation: 'slide-in-up'
              }).then(function(modal) {
                $scope.modal = modal;
                marker.addListener('click', function() {
                  console.log('helllos from marker');
                  modal.show();
                });
              });
              
              $scope.createContact = function(u) {        
                $scope.contacts.push({ name: u.firstName + ' ' + u.lastName });
                $scope.modal.hide();
                console.log('$scope.contacts -->', $scope.contacts);
              }; 
             
            });

        }, function(error){
            console.log("Could not get location");
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
