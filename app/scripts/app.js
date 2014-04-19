'use strict';

//Telling Parse what our credentials are
Parse.initialize("lza7AMhue34iPip6Vik417XREV12gWYgZMLhDIfE", "esWiobBuSmROsC8HkmqsWuGMrVlcUlVIXiWoBwWN");

angular
  .module('devilScoutzApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
