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
    $scope.ruleImpact = [];
    $scope.iconImpact = [];

    // Define vars for gaugeObj
    $scope.gaugeObject = {};
    $scope.gaugeObject.type = 'Gauge';
    $scope.gaugeObject.options = {
      width: 400,
      height: 120,
      redFrom: 90,
      redTo: 100,
      yellowFrom: 75,
      yellowTo: 90,
      minorTicks: 5
    };

    // Define vars for chartObj
    var chartRows = [];
    var chartCols =  [
    {
		'id': 'type',
		'label': 'Type',
		'type': 'string',
		'p': {}
	},
	{
		'id': 'value',
		'label': 'value',
		'type': 'number',
		'p': {}	
	}];



	/**
	 * @func submit
	 * @description: send the url to NodeJs service, get and format the results
	 */
    $scope.submit = function() {

    	console.log($scope.results.error);
    	$scope.results = {};
    	console.log($scope.results.error);

    	// Check if url is undefined
    	if(angular.isUndefined($scope.site) || angular.isUndefined($scope.site.url)) {
    		$scope.results = [];        		
    		$scope.results.error = true;        		  		
    		$scope.results.msg = 'Error: you must fill the form with an url.';
    		return;
    	}


    	// Start loading bar
    	$scope.loading = true;
    	// Init obj results with an empty msg
    	$scope.results.msg = '';


    	// === Call the PageSpeed Service === //
    	pageSpeed.getPageSpeed($scope.site).then(function(data){
    		// Debug 
    		//console.log('=========== DATA =========');
        	//console.log(data);
        	//console.log('=========== DATA =========');

        	// If data response with a status code
        	if(data.code) {
        		$scope.results = [];	
        		$scope.results.error = true;
        		//console.log(data.errors[0].message);	  		
        		$scope.results.msg = data.errors[0].message;

        	// If data OK
        	} else if(!data.status && !data.code && !angular.equals({}, data)) {

        		// Setup results object
        		$scope.results.pageStats = data.pageStats;
        		$scope.results.title = data.title;
        		$scope.results.id = data.id;
        		$scope.results.responseCode = data.responseCode;

        		// Init the formattedResults object
        		$scope.results.formattedResults = {};

        		// =================== FOREACH 'ruleResults' ====================== //
        		angular.forEach(data.formattedResults.ruleResults, function(value, key) {
        			// Init object for formatted result with 'key' value
        			// Add basics rules
        			$scope.results.formattedResults[key] = {};
    				$scope.results.formattedResults[key].ruleName = value.localizedRuleName;
    				$scope.results.formattedResults[key].ruleImpact = value.ruleImpact;

    				// If 'summary' and 'args' are present set the args
        			if(value.summary && value.summary.args) {
        				parseSummary(value, $scope.results.formattedResults[key]);       				

        			// Else if only 'summary' is present push only the summary
        			} else if (value.summary) {
        				$scope.results.formattedResults[key].summary = value.summary.format;
        			}


        			// Check for wrost 'ruleImpact' and put the class
    				if(parseFloat(value.ruleImpact) === 0) {
    					$scope.ruleImpact[key] = 'green darken-2';
    					$scope.iconImpact[key] = 'verified_user';
    				} else if(parseFloat(value.ruleImpact) < 1.00) {
    					$scope.ruleImpact[key] = 'amber darken-2';
    					$scope.iconImpact[key] = 'info';
    				} else {
    					$scope.ruleImpact[key] = 'red darken-3';
    					$scope.iconImpact[key] = 'warning';
    				}

    				//$scope.arrRuleImpact.push(parseFloat(value.ruleImpact));

    				if(value.urlBlocks) {
    					$scope.results.formattedResults[key].urlBlocks = [];
    					parseUrlBlocksHeader(value.urlBlocks, $scope.results.formattedResults[key]);
    					parseUrlBlocksUrls(value.urlBlocks, $scope.results.formattedResults[key]);
    				}

    				//console.log($scope.results.formattedResults[key].urlBlocks);		
        			
        		});

        		// ============== ENDFOREACH 'ruleResults' ================= //


        		// Define GAUGE obj with SPEED score of the website
        		$scope.gaugeObject.data = [
			      ['Label', 'Value'],
			      ['Page Speed', data.ruleGroups.SPEED.score]
			    ];

			    // call the InitChart func to init the chart
        		$scope.initChart(data.pageStats);

        		// Sett error to false
        		$scope.results.error = false;

        	// Else every error
        	} else {
        		$scope.results = [];        		
        		$scope.results.error = true;        		  		
        		$scope.results.msg = 'Error';
        	}

        	// Stop loading bar
        	$scope.loading = false;
    	});
    	
    };

   



	$scope.initChart = function(pagestat) {
		// Empty the chart rows
		chartRows = [];

		// Iterate every PAGESTAT
		angular.forEach(pagestat, function(value, key) {
			var thisVal = {
				'c': [
					{
						'v': key
					},
					{
						'v': parseInt(value)
					}
				]
			};
			chartRows.push(thisVal);
		});


		// Init the chart obj with rows and columns
		$scope.chartObject = {
		  'type': 'PieChart',
		  'displayed': false,
		  'data': {
		    'cols': chartCols,
		    'rows': chartRows
		  },
		  'options': {
		    'title': 'Response Resources',
		    'isStacked': 'true',
		    'fill': 20,
		    'displayExactValues': true,
		    'vAxis': {
		      'title': 'Response unit',
		      'gridlines': {
		        'count': 10
		      }
		    },
		    'hAxis': {
		      'title': 'Date'
		    }
		  },
		  'formatters': {}
		};		
	};



	function parseUrlBlocksHeader(urlBlocks, $theScope) {
		var i = 0;
		var linkInit, size, percentage, response;
		angular.forEach(urlBlocks, function(value) {

			// DEBUG
			//console.log(value);
			
			if(value.header.args) {
				angular.forEach(value.header.args, function(item) {
					if(item.key === 'LINK') {
						linkInit = '<a target="_blank" href="' + item.value + '">';
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

			if(value.header.format.indexOf('{{BEGIN_LINK}}') !== -1) {
				head = head.replace(/{{BEGIN_LINK}}/g, linkInit);
				head = head.replace(/{{END_LINK}}/g, '</a>');
			}
			// Could be a number of redirects
			
			if(value.header.format.indexOf('{{SIZE_IN_BYTES}}') !== -1) {
				head = head.replace(/{{SIZE_IN_BYTES}}/g, '<strong>' + size + '</strong>');
			}

			if(value.header.format.indexOf('{{PERCENTAGE}}') !== -1) {
				head = head.replace(/{{PERCENTAGE}}/g, '<strong>' + percentage + '</strong>');
			}

			if(value.header.format.indexOf('{{RESPONSE_TIME}}') !== -1) {
				head = head.replace(/{{RESPONSE_TIME}}/g, '<strong>' + response + '</strong>');
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
		var linkInit, size, percentage, response, lifetime;
		var url, redUrl;
		var head;
		angular.forEach(urlBlocks, function(urls) {
			angular.forEach(urls, function(value, key) {
				// Return if key is header
				if(key === 'header') {
					return;
				}
				

				$theScope.urlBlocks[i].urls = [];

				//console.log(value.length);
				if(value.length) {
					j = 0;
					angular.forEach(value, function(plusval) {

						head = plusval.result.format;

						angular.forEach(plusval.result.args, function(newPlusval) {
							if(newPlusval.key === 'LINK') {
								linkInit = '<a target="_blank" href="' + newPlusval.value + '">';
							} else if(newPlusval.key === 'URL') {
								url = newPlusval.value;
							} else if(newPlusval.key === 'REDIRECTED_URL') {
								redUrl = newPlusval.value;
							} else if(newPlusval.key === 'SIZE_IN_BYTES') {
								size = newPlusval.value;
							} else if(newPlusval.key === 'PERCENTAGE') {
								percentage = newPlusval.value;
							}  else if(newPlusval.key === 'LIFETIME') {
								lifetime = newPlusval.value;
							}
						});

						if(plusval.result.format.indexOf('{{BEGIN_LINK}}') !== -1) {
							head = head.replace(/{{BEGIN_LINK}}/g, linkInit);
							head = head.replace(/{{END_LINK}}/g, '</a>');
						}

						if(plusval.result.format.indexOf('{{URL}}') !== -1) {
							head = head.replace(/{{URL}}/g, '<span class="long-url">' + url + '</span>');
						}
						
						if(plusval.result.format.indexOf('{{SIZE_IN_BYTES}}') !== -1) {
							head = head.replace(/{{SIZE_IN_BYTES}}/g, '<strong>' + size + '</strong>');
						}

						if(plusval.result.format.indexOf('{{REDIRECTED_URL}}') !== -1) {
							head = head.replace(/{{REDIRECTED_URL}}/g, '<strong>' + redUrl + '</strong>');
						}

						if(plusval.result.format.indexOf('{{RESPONSE_TIME}}') !== -1) {
							head = head.replace(/{{RESPONSE_TIME}}/g, '<strong>' + response + '</strong>');
						}

						if(plusval.result.format.indexOf('{{LIFETIME}}') !== -1) {
							head = head.replace(/\({{LIFETIME}}\)/g, '<br> Lifetime: <strong>(' + lifetime + ')</strong>');
						}

						if(plusval.result.format.indexOf('{{PERCENTAGE}}') !== -1) {
							head = head.replace(/{{PERCENTAGE}}/g, '<strong>' + percentage + '</strong>');
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
							linkInit = '<a target="_blank" href="' + item.value + '">';
						} else if(item.key === 'SIZE_IN_BYTES') {
							size = item.value;
						} else if(item.key === 'PERCENTAGE') {
							percentage = item.value;
						} else if(item.key === 'RESPONSE_TIME') {
							response = item.value;
						}
					});

					if(value.format.indexOf('{{SIZE_IN_BYTES}}') !== -1) {
						head = head.replace(/{{SIZE_IN_BYTES}}/g, '<strong>' + size + '</strong>');
					}

					if(value.format.indexOf('{{PERCENTAGE}}') !== -1) {
						head = head.replace(/{{PERCENTAGE}}/g, '<strong>' + percentage + '</strong>');
					}

					if(value.format.indexOf('{{RESPONSE_TIME}}') !== -1) {
						head = head.replace(/{{RESPONSE_TIME}}/g, '<strong>' + response + '</strong>');
					}		
				}
				// Put all in var urls[0]
				$theScope.urlBlocks[i].urls[0] = head;
				
			});

			i++;
		});

	} 


	function parseSummary(value, $theScope) {
		var summ = value.summary.format;
		var linkInit, nScripts, nCss, nRedirects;
		console.log(value);

		if(value.summary.args) {
			angular.forEach(value.summary.args, function(item) {
				if(item.key === 'LINK') {
					linkInit = '<a target="_blank" href="' + item.value + '">';
				} else if(item.key === 'NUM_SCRIPTS') {
					nScripts = item.value;
				} else if(item.key === 'NUM_CSS') {
					nCss = item.value;
				} else if(item.key === 'NUM_REDIRECTS') {
					nRedirects = item.value;
				}
			});
		}


		if(summ.indexOf('{{BEGIN_LINK}}') !== -1) {
			summ = summ.replace(/{{BEGIN_LINK}}/g, linkInit);
			summ = summ.replace(/{{END_LINK}}/g, '</a>');
		// Could be a number of redirects
		}

		if(summ.indexOf('{{NUM_SCRIPTS}}') !== -1) {
			summ = summ.replace(/{{NUM_SCRIPTS}}/g, '<strong>' + nScripts + '</strong>');
		} 

		if(summ.indexOf('{{NUM_CSS}}') !== -1) {
			summ = summ.replace(/{{NUM_CSS}}/g, '<strong>' + nCss + '</strong>');
		}

		if(summ.indexOf('{{NUM_REDIRECTS}}') !== -1) {
			summ = summ.replace(/{{NUM_REDIRECTS}}/g, '<strong>' + nRedirects + '</strong>');
		}
		//======== Could be something else? ========//

		// Push the new summary inside the 'key' formatted result
		$theScope.summary = summ;	
	} 

	
  });
