/*
 * Facebox (for jQuery)
 * version: 1.2 (05/05/2008)
 * @requires jQuery v1.2 or later
 *
 * Examples at http://famspam.com/facebox/
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2007, 2008 Chris Wanstrath [ chris@ozmm.org ]
 *
 * Usage:
 *
 *  jQuery(document).ready(function() {
 *    jQuery('a[rel*=facebox]').facebox()
 *  })
 *
 *  <a href="#terms" rel="facebox">Terms</a>
 *    Loads the #terms div in the box
 *
 *  <a href="terms.html" rel="facebox">Terms</a>
 *    Loads the terms.html page in the box
 *
 *  <a href="terms.png" rel="facebox">Terms</a>
 *    Loads the terms.png image in the box
 *
 *
 *  You can also use it programmatically:
 *
 *    jQuery.facebox('some html')
 *    jQuery.facebox('some html', 'my-groovy-style')
 *
 *  The above will open a facebox with "some html" as the content.
 *
 *    jQuery.facebox(function($) {
 *      $.get('blah.html', function(data) { $.facebox(data) })
 *    })
 *
 *  The above will show a loading screen before the passed function is called,
 *  allowing for a better ajaxy experience.
 *
 *  The facebox function can also display an ajax page, an image, or the contents of a div:
 *
 *    jQuery.facebox({ ajax: 'remote.html' })
 *    jQuery.facebox({ ajax: 'remote.html' }, 'my-groovy-style')
 *    jQuery.facebox({ image: 'stairs.jpg' })
 *    jQuery.facebox({ image: 'stairs.jpg' }, 'my-groovy-style')
 *    jQuery.facebox({ div: '#box' })
 *    jQuery.facebox({ div: '#box' }, 'my-groovy-style')
 *
 *  Want to close the facebox?  Trigger the 'close.facebox' document event:
 *
 *    jQuery(document).trigger('close.facebox')
 *
 *  Facebox also has a bunch of other hooks:
 *
 *    loading.facebox
 *    beforeReveal.facebox
 *    reveal.facebox (aliased as 'afterReveal.facebox')
 *    init.facebox
 *
 *  Simply bind a function to any of these hooks:
 *
 *   $(document).bind('reveal.facebox', function() { ...stuff to do after the facebox and contents are revealed... })
 *
 */
(function($) {
	$.facebox = function(data, className) {
		$.facebox.loading();

		if (data.ajax) {
			fillFaceboxFromAjax(data.ajax, className);
		}
		else if (data.image) {
			fillFaceboxFromImage(data.image, className);
		}
		else if (data.div) {
			fillFaceboxFromHref(data.div, className);
		}
		else if ($.isFunction(data)) {
			data.call($);
		}
		else {
			$.facebox.reveal(data, className);
		}
	}

	/*
	 * Public, $.facebox methods
	 */

	$.extend($.facebox, {
		settings: {
			parent		 : 'body',
			opacity      : .30,
			overlay      : true,
			borderOpacity: .4,
			width		 : 500,
			loadingImage : '/facebox/loading.gif',
			imageTypes   : [ 'png', 'jpg', 'jpeg', 'gif' ],
			faceboxHtml  : '\
			    <div id="facebox" style="display:none;">\
					<a href="#" class="close">Close</a>\
					<div class="borders"></div>\
					<div class="content"></div>\
				</div>'
		},

		loading: function() {
			init();

			var $facebox = $('#facebox'),
				$window = $(window);

			if ($facebox.find('.loading').length == 1) {
				return true;
			}

			showOverlay();

			$facebox
				.find('.content')
					.empty()
				.end()
				.children()
					.hide()
				.end()
				.append('<div class="loading"><img src="'+$.facebox.settings.loadingImage+'"/></div>')
				.css({
					top:	$window.scrollTop() + ($window.height() / 10),
					left:	$window.width() / 2 - 205
				})
				.show();

			$(document)
				.bind('keydown.facebox', function(e) {
					if (e.keyCode == 27) {
						$.facebox.close();
					}
					return true;
				})
				.trigger('loading.facebox');
		},

		reveal: function(data, className) {
			var $facebox = $('#facebox'),
				$content = $facebox.find('.content');
			$(document).trigger('beforeReveal.facebox');
			if (className) {
				$('#facebox .content').addClass(className);
			}

			$content
				.append(data);
			$facebox
				.find('.loading')
					.remove()
				.end()
				.children()
					.fadeIn('normal')
				.end()
				.find('.borders')
					.css('height', $facebox.outerHeight())
				.end()
				.css({
					left: $(window).width() / 2 - ($content.width() / 2)
				});
			$(document).trigger('reveal.facebox').trigger('afterReveal.facebox');
	    },

		close: function() {
			$(document).trigger('close.facebox');
			return false;
		}
	});

	/*
	 * Public, $.fn methods
	 */

	$.fn.facebox = function(settings) {
		if ($(this).length == 0) {
    		return;
		}

		init(settings);
		return this.bind('click.facebox', function() {
			$.facebox.loading(true);

			// support for rel="facebox.inline_popup" syntax, to add a class
			// also supports deprecated "facebox[.inline_popup]" syntax
			var className = this.rel.match(/facebox\[?\.(\w+)\]?/);
			if (className) {
				className = className[1];
			}

			fillFaceboxFromHref(this.href, className);
			return false;
		});
	}

	/*
	 * Private methods
	 */

	// called one time to setup facebox on this page
	function init(settings) {
		settings = settings || {};
		var parent = settings.parent || $.facebox.settings.parent;
			$parent = $(parent);
		if ($parent.data('facebox.initialized')) {
			$.facebox.settings = $parent.data('facebox.settings');
			return true;
		}
		$parent.data('facebox.initialized', true);

		$(document).trigger('init.facebox');

		var imageTypes = $.facebox.settings.imageTypes.join('|');
		$.facebox.settings.imageTypesRegexp = new RegExp('\.(' + imageTypes + ')$', 'i');

		if (settings) {
			$.extend($.facebox.settings, settings);
		}
		$parent.append($.facebox.settings.faceboxHtml);

		var preload = [ new Image() ];
		preload[0].src = $.facebox.settings.loadingImage;

		$('#facebox .close').click($.facebox.close)
		$parent.data('facebox.settings', $.facebox.settings);
	}

	// Figures out what you want to display and displays it
	// formats are:
	//     div: #id
	//   image: blah.extension
	//    ajax: anything else
	function fillFaceboxFromHref(href, className) {
		// div
		if (href.match(/#/)) {
			var url    = window.location.href.split('#')[0];
			var target = href.replace(url,'');
			if (target == '#') {
				return;
			}
			$.facebox.reveal($(target).html(), className);
		}
		// image
		else if (href.match($.facebox.settings.imageTypesRegexp)) {
			fillFaceboxFromImage(href, className);
		// ajax
		} else {
			fillFaceboxFromAjax(href, className);
		}
	}

	function fillFaceboxFromImage(href, className) {
		var image = new Image();
		image.onload = function() {
			$.facebox.reveal('<div class="image"><img src="' + image.src + '" /></div>', className);
		}
		image.src = href;
	}

	function fillFaceboxFromAjax(href, className) {
		$.get(href, function(data) { $.facebox.reveal(data, className) });
	}

	function skipOverlay() {
		return $.facebox.settings.overlay == false || $.facebox.settings.opacity === null;
	}

	function showOverlay() {
		if (!skipOverlay()) {
			var $facebox_overlay = $('#facebox_overlay');
			if ($facebox_overlay.length == 0) {
				$facebox_overlay = $('<div id="facebox_overlay" class="facebox_hide"></div>').appendTo('body');
			}

			$facebox_overlay
				.hide()
				.addClass("facebox_overlayBG")
				.css('opacity', $.facebox.settings.opacity)
				.click(function() {
					$(document).trigger('close.facebox')
				})
				.fadeIn('fast');
		}
		return false;
	}

	function hideOverlay() {
		if (!skipOverlay()) {
			$('#facebox_overlay').fadeOut('fast', function(){
				$("#facebox_overlay")
					.removeClass("facebox_overlayBG")
					.addClass("facebox_hide")
					.remove();
			})
		}
		return false;
	}

	/*
	 * Bindings
	 */

	$(document).bind('close.facebox', function() {
		$(document).unbind('keydown.facebox');
		$('#facebox').fadeOut(function() {
			$('#facebox .content').removeClass().addClass('content');
			hideOverlay();
			$('#facebox .loading').remove();
		});
	});

})(jQuery);