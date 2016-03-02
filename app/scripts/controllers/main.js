'use strict';

/**
 * @ngdoc function
 * @name ngPgspeedApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ngPgspeedApp
 */
angular.module('ngPgspeedApp')
  .controller('MainCtrl', function ($scope, pageSpeed) {
    $scope.site = { 'url': 'http://www.example.com' };
    $scope.results = [];
    $scope.gaugeObject = {};
    $scope.gaugeObject.type = "Gauge";

    $scope.gaugeObject.options = {
      width: 400,
      height: 120,
      redFrom: 90,
      redTo: 100,
      yellowFrom: 75,
      yellowTo: 90,
      minorTicks: 5
    };

    $scope.submit = function() {
    	$scope.loading = true;
    	pageSpeed.getPageSpeed($scope.site).then(function(data){
        	console.log(data);
        	if(!data.status) {
        		$scope.results = data;
        		console.log(data.pageStats);

        		$scope.gaugeObject.data = [
			      ['Label', 'Value'],
			      ['Page Speed', data.ruleGroups.SPEED.score]
			    ];

        		$scope.initChart(data.pageStats);
        		$scope.results.error = false;	
        	} else {
        		$scope.results = [];        		
        		$scope.results.error = true;
        	}        	
        	$scope.loading = false;
    	});
    	
    };

    var chartRows = [];
    var chartCols =  [
    {
		"id": "type",
		"label": "Type",
		"type": "string",
		"p": {}
	},
	{
		"id": "value",
		"label": "value",
		"type": "number",
		"p": {}	
	}];



	$scope.initChart = function(pagestat) {
		chartRows = [];

		console.log(pagestat);
		angular.forEach(pagestat, function(value, key) {

			var value = {
				"c": [
					{
						"v": key
					},
					{
						"v": parseInt(value)
					}
				]
			}
			chartRows.push(value);
		});

		$scope.chartObject = {
		  "type": "PieChart",
		  "displayed": false,
		  "data": {
		    "cols": chartCols,
		    "rows": chartRows
		  },
		  "options": {
		    "title": "Sales per month",
		    "isStacked": "true",
		    "fill": 20,
		    "displayExactValues": true,
		    "vAxis": {
		      "title": "Sales unit",
		      "gridlines": {
		        "count": 10
		      }
		    },
		    "hAxis": {
		      "title": "Date"
		    }
		  },
		  "formatters": {}
		}
	}




    

	
  });
