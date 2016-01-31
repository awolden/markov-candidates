'use strict';

angular.module('bots', [])
  .controller('mainCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.message = '';
    $scope.people = {
      berniesanders: 'Bernie Sanders',
      hillaryclinton: 'Hillary Clinton',
      donaldtrump: 'Donald Trump'
    };

    $scope.togglePerson = function(person) {
      $scope.response = undefined;
      $scope.selectedPerson = person;
    };

    $scope.personSelected = function(person) {
      return person === $scope.selectedPerson;
    };

    $scope.getReply = function() {
      $scope.response = undefined;
      $http.post('/chat/' + $scope.selectedPerson, {
        message: $scope.message
      }).success(function(data) {
        $scope.response = data;
      });
    };

    $scope.selectedPerson = 'berniesanders';
    $http = $http;
  }]);
