/*
 * If USE_HASH_LOCATION is true, then location if of the form: index.html#main.md
 * else, location is of the form: index.html?p=main.md
 * */
var USE_HASH_LOCATION = true;
var CURRENT_PAGE = null;

function goToPage(filename) {
	if (!USE_HASH_LOCATION) {
		var queryParameters = {}, queryString = location.search.substring(1),
		re = /([^&=]+)=([^&]*)/g, m;

		while (m = re.exec(queryString)) {
			queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
		}

		queryParameters['p'] = filename;
		location.search = $.param(queryParameters);
	} else {
		loadMainMarkdown(filename);
	}
}

function cleanCurrentPageActiveStyle() {
	$( ".sidebar-md li" ).removeClass("active");
}

function setCurrentPageActiveStyle() {
	var filename_ext = CURRENT_PAGE.split('.').pop();
	var filename = CURRENT_PAGE.substr(0,CURRENT_PAGE.length - filename_ext.length - 1);
	
	$($( ".sidebar-md a.__page_"+filename ).parent()).addClass("active");
}

function loadMainMarkdown(filename) {
	if (CURRENT_PAGE != filename) {
		CURRENT_PAGE = filename;
		cleanCurrentPageActiveStyle();	
		
		// Using the core $.ajax() method
		$.ajax({
			// The URL for the request
			url: filename,

			// The data to send (will be converted to a query string)
			data: {},

			// Whether this is a POST or GET request
			type: "GET",

			// The type of data we expect back
			dataType : "html",

			// Code to run if the request succeeds;
			// the response is passed to the function
			success: function( md ) {
				$( document ).scrollTop(0);
				$( ".main-md" ).html(micromarkdown.parse(md));
				$( "body" ).removeClass("error404");
				setCurrentPageActiveStyle();
			},

			// Code to run if the request fails; the raw request and
			// status codes are passed to the function
			error: function( xhr, status, errorThrown ) {
				$( "body" ).addClass("error404");
				console.log( "Error: " + errorThrown );
				console.log( "Status: " + status );
				console.dir( xhr );
			},

			// Code to run regardless of success or failure
			complete: function( xhr, status ) {			
				if (USE_HASH_LOCATION) {				
					var newHash = '#' + CURRENT_PAGE;
					
					if (window.location.hash != newHash) {
						window.location.hash = newHash;
					}
				}
			}
		});
	}
}

function loadCurrentState() {
	var newPage = null;

	if (USE_HASH_LOCATION) {
		var hash = window.location.hash;
		if (hash.length > 1) {
			newPage = hash.substring(1);
		} else {
			newPage = "main.md";
		}
	} else {
		var queryParameters = {}, queryString = location.search.substring(1),
			re = /([^&=]+)=([^&]*)/g, m;

		// Creates a map with the query string parameters
		while (m = re.exec(queryString)) {
			queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
		}

		if (!queryParameters['p']) {
			// No page found. Go to default.
			goToPage('main.md');
		} else {
			newPage = queryParameters['p'];
		}
	}

	if ((newPage) && (newPage != CURRENT_PAGE)) {
		// Using the core $.ajax() method
		$.ajax({
			// The URL for the request
			url: "sidebar.md",

			// The data to send (will be converted to a query string)
			data: {},

			// Whether this is a POST or GET request
			type: "GET",

			// The type of data we expect back
			dataType : "html",

			// Code to run if the request succeeds;
			// the response is passed to the function
			success: function( md ) {
				$( ".sidebar-md" ).html(micromarkdown.parse(md));
			},

			// Code to run if the request fails; the raw request and
			// status codes are passed to the function
			error: function( xhr, status, errorThrown ) {
				alert( "Sorry, there was a problem!" );
				console.log( "No sidebar.md found!" );
				console.log( "Error: " + errorThrown );
				console.log( "Status: " + status );
				console.dir( xhr );
			},

			// Code to run regardless of success or failure
			complete: function( xhr, status ) {
				$($( ".sidebar-md" ).children()[0]).addClass("nav nav-sidebar");
			}
		});
		
		loadMainMarkdown(newPage);
	}
}

$(document).on({
    ajaxStart: function() {
		$("body").addClass("loading");
	},
    ajaxStop: function() {
		$("body").removeClass("loading");
	}
});

$(window).on('hashchange', function() {
	loadCurrentState();
});

$(document).ready(function() {
	loadCurrentState();
});