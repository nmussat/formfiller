/**
  * Form Filler
  * Automatic HTML forms filler
  *
  * Check http://form-filler.appspot.com for more information
  */

(function() {
	
	var staticHost      = '/static',
		jqFormFiller	= null;

	// Asynchronous resources loading
	var loadResources = function(data, callback) {
		var head = document.getElementsByTagName('head')[0],
			data = data || {},
			count = data.length;
		
		for (var o in data) {
			var url = o.url,
				e = null;
			if (/\.css$/.test(url)) {
				e = document.createElement('link');
				e.rel = 'stylesheet';
				e.type = 'text/css';
				e.href = url;
			}
			else if (/\.js$/.test(url)) {
				e = document.createElement('script');
				e.type = 'text/javascript';
				e.href = url;
			}
			if (e) {
				e.onload = function() {
				    alert('load');
					if (--count <= 0 && callback && typeof callback == 'function') {
						callback();
					}
				}			
				head.append(e);
			}
		}
	}

	// Main Form Filler logic
	var formFillerUI = function($) {
		// Load main UI
		alert('loaded');
		// $.facebox({ ajax: 'http://form-filler.appspot.com/api/forms' });
	};
	
	// Initialization
	loadResources([
	    // { url: staticHost + '/css/formfiller.bookmarklet.css' },
	    { url: staticHost + '/js/jquery.min.1.3.2.js', callback: function() { jqFormFiller = jQuery.noConflict(); }},
		// { url: staticHost + '/js/jquery.facebox.js' }
	], function() { formFillerUI(jqFormFiller); });
	
})();