'use strict';

angular.module('devilScoutzApp')
  .controller('MainCtrl', function ($scope) {
    
    $scope.state = "Dashboard";

    //This array holds all our data we collect over time
    $scope.matches = [
      {matchNum:0, 
       teamNum:0, 
       alliance:0, 
       autoHighGoalCount:0, 
       autoLowGoalCount:0, 
       autoHotGoalCount:0,
       teleAssistCount:0, 
       teleHighGoalCount:0, 
       teleLowGoalCount:0, 
       trussCount:0, 
       catchCount:0, 
       matchComment:"",
       synced:true}
    ];

    $scope.matches.length = 0;

    //This array holds all our data from the database
    $scope.databaseMatches = [
      {matchNum:0, 
       teamNum:0, 
       alliance:0, 
       autoHighGoalCount:0, 
       autoLowGoalCount:0, 
       autoHotGoalCount:0,
       teleAssistCount:0, 
       teleHighGoalCount:0, 
       teleLowGoalCount:0, 
       trussCount:0, 
       catchCount:0, 
       matchComment:""}
    ];
  
    //Used to temporarily store match data
    $scope.matchNum = 0;
    $scope.teamNum = 0;
    $scope.alliance = 0;
    $scope.autoHighGoalCount = 0;
    $scope.autoLowGoalCount = 0;
    $scope.autoHotGoalCount = 0;
    $scope.teleAssistCount = 0;
    $scope.teleHighGoalCount = 0;
    $scope.teleLowGoalCount = 0;
    $scope.trussCount = 0;
    $scope.catchCount = 0;
    $scope.matchComment = "";

    //Appends current match data into our match history array
    $scope.saveMatch = function() {

      $scope.state = "Dashboard";

      $scope.matches.push({matchNum:$scope.matchNum, 
                           teamNum:$scope.teamNum, 
                           alliance:$scope.alliance,
                           autoHighGoalCount:$scope.autoHighGoalCount,
                           autoLowGoalCount:$scope.autoLowGoalCount,
                           autoHotGoalCount:$scope.autoHotGoalCount,
                           teleAssistCount:$scope.teleAssistCount,
                           teleHighGoalCount:$scope.teleHighGoalCount,
                           teleLowGoalCount:$scope.teleLowGoalCount, 
                           trussCount:$scope.trussCount, 
                           catchCount:$scope.catchCount,
                           matchComment:$scope.matchComment,
                           synced:false});

      $scope.matchNum = 0;
      $scope.teamNum = 0;
      $scope.alliance = 0;
      $scope.autoHighGoalCount = 0;
      $scope.autoLowGoalCount = 0;
      $scope.autoHotGoalCount = 0;
      $scope.teleAssistCount = 0;
      $scope.teleHighGoalCount = 0;
      $scope.teleLowGoalCount = 0;
      $scope.trussCount = 0;
      $scope.catchCount = 0;
      $scope.matchComment = "";
      
    };

    //Helper function to refresh ng-repeat when array updates
    var applyFn = function () {
        $scope.someProp = "123";
    };
  
    //Loops through our match history array and syncs it to parse database
    $scope.sync = function() {

      angular.forEach($scope.matches,function(data,index){

          if (data.synced === false) {
           var ScoutingData = Parse.Object.extend("Teams");
           var scoutingData = new ScoutingData();
        
          scoutingData.set("matchNum", Number(data.matchNum));
          scoutingData.set("teamNum", Number(data.teamNum));
          scoutingData.set("alliance", data.alliance);
          scoutingData.set("autoHighGoal", data.autoHighGoalCount);
          scoutingData.set("autoLowGoal", data.autoLowGoalCount);
          scoutingData.set("autoHotGoal", data.autoHotGoalCount);
          scoutingData.set("assists", data.teleAssistCount);
          scoutingData.set("teleHighGoal", data.teleHighGoalCount);
          scoutingData.set("teleLowGoal", data.teleLowGoalCount);
          scoutingData.set("truss", data.trussCount);
          scoutingData.set("catch", data.catchCount);
          scoutingData.set("comment", data.matchComment);
    
          scoutingData.save(null, {
            success: function(scoutingData) {
              // Execute any logic that should take place after the object is saved.
              data.synced = true;
              //alert(index);

                if ($scope.$$phase) {
                    applyFn();
                } else {
                    $scope.$apply(applyFn);
                }

            },
            error: function(scoutingData, error) {
              // Execute any logic that should take place if the save fails.
            }
          });
          }

      });
    };

    //Pull data
    //Here it is tricky because we cant pull all items from Parse.com at once, there is a request limit of 100 items in a query.
    //We can get around this by finding out how many items there are total, and doing multiple, smaller sized requests. 
    $scope.pullData = function () {
      $scope.databaseMatches.length = 0;
      var ScoutingData = Parse.Object.extend("Teams");
      var query = new Parse.Query(ScoutingData);
      query.notEqualTo("teamNum", 0);
      var numIterations = 0; //We need to count the number of times we are going to iterate in the loop.
      query.count({ //Get a count of the total number of items in the database.
        success: function(count) {
          numIterations = Math.ceil(count / 90);
          for (var i = 0; i < numIterations; i++) {
              query = new Parse.Query(ScoutingData);
              query.notEqualTo("teamNum", 0);
              query.lessThan("matchNum", 16 + i*15); //Here we are getting a range between 15 match numbers, allowing for a max of 90 matches in one request
              query.greaterThan("matchNum", 0 + i*15); //Example, lessThan(30) and greaterThan(15).

              query.find({
                success: function(results) {
                  // Do something with the returned Parse.Object values
                  for (var i = 0; i < results.length; i++) { 
                    var object = results[i];
                    $scope.databaseMatches.push({matchNum:object.get("matchNum"), 
                                   teamNum:object.get("teamNum"), 
                                   alliance:object.get("alliance"),
                                   autoHighGoalCount:object.get("autoHighGoal"),
                                   autoLowGoalCount:object.get("autoLowGoal"),
                                   autoHotGoalCount:object.get("autoHighGoal"),
                                   teleAssistCount:object.get("assists"),
                                   teleHighGoalCount:object.get("teleHighGoal"),
                                   teleLowGoalCount:object.get("teleLowGoal"), 
                                   trussCount:object.get("truss"), 
                                   catchCount:object.get("catch"),
                                   matchComment:object.get("comment")});
                  }
                  if ($scope.$$phase) {
                      applyFn();
                  } else {
                      $scope.$apply(applyFn);
                  }
                }, error: function(error) {
                  alert("Unable to retrieve matches. Make sure you are connected to the internet");
                }
              });
            }
        },
        error: function(error) {
          // The request to get the count of items failed
        }
      });
    };
  
    //Alliance
    $scope.selectAlliance = function(alliancePick) {
      $scope.alliance = alliancePick;
    };
   
    //Auto Low Goal
    $scope.decreaseAutoLowGoalCount = function () {
        if ($scope.autoLowGoalCount > 0) {
            $scope.autoLowGoalCount--;
        }
    };

    $scope.increaseAutoLowGoalCount = function () {
        $scope.autoLowGoalCount++;
    };
  
    //Auto High Goal
    $scope.decreaseAutoHighGoalCount = function () {
        if ($scope.autoHighGoalCount > 0) {
            $scope.autoHighGoalCount--;
        }
    };
    
    $scope.increaseAutoHighGoalCount = function () {
        $scope.autoHighGoalCount++;
    };

    //Auto Hot Goal
    $scope.decreaseAutoHotGoalCount = function () {
        if ($scope.autoHotGoalCount > 0) {
            $scope.autoHotGoalCount--;
        }
    };

    $scope.increaseAutoHotGoalCount = function () {
        $scope.autoHotGoalCount++;
    };

    //Tele Assist
    $scope.increaseTeleAssistCount = function () {
        $scope.teleAssistCount++;
    };
  
    $scope.decreaseTeleAssistCount = function () {
        if ($scope.teleAssistCount > 0) {
            $scope.teleAssistCount--;
        }
    };

    //Tele High Goal
    $scope.increaseTeleHighGoalCount = function () {
        $scope.teleHighGoalCount++;
    };
  
    $scope.decreaseTeleHighGoalCount = function () {
        if ($scope.teleHighGoalCount > 0) {
            $scope.teleHighGoalCount--;
        }
    };

    //Tele Low Goal
    $scope.increaseTeleLowGoalCount = function () {
        $scope.teleLowGoalCount++;
    };
  
    $scope.decreaseTeleLowGoalCount = function () {
        if ($scope.teleLowGoalCount > 0) {
            $scope.teleLowGoalCount--;
        }
    };
  
    //Truss
    $scope.increaseTrussCount = function () {
        $scope.trussCount++;
    };
  
    $scope.decreaseTrussCount = function () {
        if ($scope.trussCount > 0) {
            $scope.trussCount--;
        }
    };
  
    //Catch
    $scope.increaseCatchCount = function () {
        $scope.catchCount++;
    };
  
    $scope.decreaseCatchCount = function () {
        if ($scope.catchCount > 0) {
            $scope.catchCount--;
        }

    };

  });
