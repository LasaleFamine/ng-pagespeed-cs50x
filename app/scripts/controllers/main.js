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
    //$scope.site = { 'url': 'http://www.example.com' };
    $scope.results = {};
    $scope.gaugeObject = {};
    $scope.gaugeObject.type = "Gauge";
    $scope.ruleImpact = [];

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
    	$scope.results.msg = "";
    	var summ = "";
    	pageSpeed.getPageSpeed($scope.site).then(function(data){
        	console.log(data);
        	if(!data.status && !data.code) {

        		// Setup results object
        		$scope.results.pageStats = data.pageStats;
        		$scope.results.title = data.title;
        		$scope.results.id = data.id;
        		$scope.results.responseCode = data.responseCode;
        		// Init the formattedResults object
        		$scope.results.formattedResults = {};

        		// =================== FOREACH "ruleResults" ====================== //
        		angular.forEach(data.formattedResults.ruleResults, function(value, key) {
        			// Init object for formatted result with "key" value
        			// Add basics rules
        			$scope.results.formattedResults[key] = {};
    				$scope.results.formattedResults[key].ruleName = value.localizedRuleName;
    				$scope.results.formattedResults[key].ruleImpact = value.ruleImpact;

    				// If "summary" and "args" are present set the args
        			if(value.summary && value.summary.args) {
        				// Could be a link    					
        				var linkInit = '<a href="' + value.summary.args[0].value + '">';
        				if(value.summary.format.indexOf("{{BEGIN_LINK}}") !== -1) {
		        			summ = value.summary.format.replace(/{{BEGIN_LINK}}/g, linkInit);
		        			summ = summ.replace(/{{END_LINK}}/g, '</a>');
		        		// Could be a number of redirects
        				} else if(value.summary.format.indexOf("{{NUM_REDIRECTS}}") !== -1) {
        					summ = value.summary.format.replace(/{{NUM_REDIRECTS}}/g, "<strong>" + value.summary.args[0].value + "</strong>");
        				}
        				//======== Could be something else? ========//

        				// Push the new summary inside the "key" formatted result
        				$scope.results.formattedResults[key].summary = summ;	

        			// Else if only "summary" is present push only the summary
        			} else if (value.summary) {
        				$scope.results.formattedResults[key].summary = value.summary.format;
        			}


        			// Check for wrost "ruleImpact" and put the class
    				if(parseFloat(value.ruleImpact) < 1.00) {
    					$scope.ruleImpact[key] = "success";
    				} else {
    					$scope.ruleImpact[key] = "danger";
    				}   

    				if(value.urlBlocks) {
    					$scope.results.formattedResults[key].urlBlocks = [];
    					parseUrlBlocksHeader(value.urlBlocks, $scope.results.formattedResults[key]);
    					parseUrlBlocksUrls(value.urlBlocks, $scope.results.formattedResults[key]);
    				}

    				console.log($scope.results.formattedResults[key]);		
        			
        		});

        		// ============== ENDFOREACH "ruleResults" ================= //

        		

        		console.log($scope.results);

        		$scope.gaugeObject.data = [
			      ['Label', 'Value'],
			      ['Page Speed', data.ruleGroups.SPEED.score]
			    ];

        		$scope.initChart(data.pageStats);
        		$scope.results.error = false;	
        	} else if(data.code) {
        		$scope.results = [];        		
        		$scope.results.error = true;
        		console.log(data.errors[0].message); 		  		
        		$scope.results.msg = data.errors[0].message;
        	} else {
        		$scope.results = [];        		
        		$scope.results.error = true;        		  		
        		$scope.results.msg = "Error";
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

			var thisVal = {
				"c": [
					{
						"v": key
					},
					{
						"v": parseInt(value)
					}
				]
			};
			chartRows.push(thisVal);
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
		};
	};

	function parseUrlBlocksHeader(urlBlocks, $theScope) {
		var i = 0;
		var linkInit, size, percentage, response;
		angular.forEach(urlBlocks, function(value, key) {

			// DEBUG
			//console.log(value);
			
			if(value.header.args) {
				angular.forEach(value.header.args, function(item) {
					if(item.key === 'LINK') {
						linkInit = '<a href="' + item.value + '">';
					} else if(item.key === 'SIZE_IN_BYTES') {
						size = item.value;
					} else if(item.key === 'PERCENTAGE') {
						percentage = item.value;
					} else if(item.key === 'RESPONSE_TIME') {
						response = item.value;
					}
				});
			}

			var head = value.header.format;

			if(value.header.format.indexOf("{{BEGIN_LINK}}") !== -1) {
				head = head.replace(/{{BEGIN_LINK}}/g, linkInit);
				head = head.replace(/{{END_LINK}}/g, '</a>');
			}
			// Could be a number of redirects
			
			if(value.header.format.indexOf("{{SIZE_IN_BYTES}}") !== -1) {
				head = head.replace(/{{SIZE_IN_BYTES}}/g, "<strong>" + size + "</strong>");
			}

			if(value.header.format.indexOf("{{PERCENTAGE}}") !== -1) {
				head = head.replace(/{{PERCENTAGE}}/g, "<strong>" + percentage + "</strong>");
			}

			if(value.header.format.indexOf("{{RESPONSE_TIME}}") !== -1) {
				head = head.replace(/{{RESPONSE_TIME}}/g, "<strong>" + response + "</strong>");
			}

			// DEBUG
			//console.log($theScope);

			$theScope.urlBlocks[i] = {};
			$theScope.urlBlocks[i].head = head;

			i++;
		});

	}

	function parseUrlBlocksUrls(urlBlocks, $theScope) {
		var i = 0;
		var j;
		var linkInit, size, percentage, response;
		var url, redUrl;
		var head;
		angular.forEach(urlBlocks, function(urls) {
			angular.forEach(urls, function(value, key) {

				$theScope.urlBlocks[i].urls = [];

				//console.log(value);

				//console.log(value.length);
				if(value.length) {
					j = 0;
					angular.forEach(value, function(plusval) {

						head = plusval.result.format;

						angular.forEach(plusval.result.args, function(newPlusval) {
							if(newPlusval.key === 'URL') {
								url = newPlusval.value;
							} else if(newPlusval.key === 'REDIRECTED_URL') {
								redUrl = newPlusval.value;
							} else if(newPlusval.key === 'SIZE_IN_BYTES') {
								size = newPlusval.value;
							} else if(newPlusval.key === 'PERCENTAGE') {
								percentage = newPlusval.value;
							}
						});
						
						if(plusval.result.format.indexOf("{{SIZE_IN_BYTES}}") !== -1) {
							head = head.replace(/{{SIZE_IN_BYTES}}/g, "<strong>" + size + "</strong>");
						}

						if(plusval.result.format.indexOf("{{REDIRECTED_URL}}") !== -1) {
							head = head.replace(/{{REDIRECTED_URL}}/g, "<strong>" + redUrl + "</strong>");
						}

						if(plusval.result.format.indexOf("{{RESPONSE_TIME}}") !== -1) {
							head = head.replace(/{{RESPONSE_TIME}}/g, "<strong>" + response + "</strong>");
						}

						if(plusval.result.format.indexOf("{{RESPONSE_TIME}}") !== -1) {
							head = head.replace(/{{RESPONSE_TIME}}/g, "<strong>" + response + "</strong>");
						}
						$theScope.urlBlocks[i].urls[j] = head;
						j++;
					});
				}

				// Standard case put format in var head
				if(value.format) {
					head = value.format;
				}				
				// If we have args check for it
				if(value.args) {
					angular.forEach(value.args, function(item) {
						if(item.key === 'LINK') {
							linkInit = '<a href="' + item.value + '">';
						} else if(item.key === 'SIZE_IN_BYTES') {
							size = item.value;
						} else if(item.key === 'PERCENTAGE') {
							percentage = item.value;
						} else if(item.key === 'RESPONSE_TIME') {
							response = item.value;
						}
					});

					if(value.format.indexOf("{{SIZE_IN_BYTES}}") !== -1) {
						head = head.replace(/{{SIZE_IN_BYTES}}/g, "<strong>" + size + "</strong>");
					}

					if(value.format.indexOf("{{PERCENTAGE}}") !== -1) {
						head = head.replace(/{{PERCENTAGE}}/g, "<strong>" + percentage + "</strong>");
					}

					if(value.format.indexOf("{{RESPONSE_TIME}}") !== -1) {
						head = head.replace(/{{RESPONSE_TIME}}/g, "<strong>" + response + "</strong>");
					}		
				}
				// Put all in var urls[0]
				$theScope.urlBlocks[i].urls[0] = head;


				
			});

			i++;
		});

	}




    

	
  });
