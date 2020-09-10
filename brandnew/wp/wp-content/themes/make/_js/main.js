// FOR SEARCH LAYOVER

jQuery(function ($)  {
	
	$('.toggle-search').click(function() {
        if ($('body').hasClass('show-search')) {
            $('body').removeClass('show-search').addClass('hide-search');

            setTimeout(function() {
                $('body').removeClass('hide-search');
            }, 500);

        } else {
            $('body').removeClass('hide-search').addClass('show-search');
        }

		return false;
	});
	
});

// FOR BROWSE LAYOVER

$(function() {
	
	$('.toggle-nav').click(function() {
        if ($('body').hasClass('show-nav')) {
            $('body').removeClass('show-nav').addClass('hide-nav');

            setTimeout(function() {
                $('body').removeClass('hide-nav');
            }, 500);

        } else {
            $('body').removeClass('hide-nav').addClass('show-nav');
        }

		return false;
	});
	
});

// FOR STICKY HEADER

// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('#codename_cat').outerHeight() +70;

$(window).scroll(function(event){
    didScroll = true;
});

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 50);

function hasScrolled() {
    var st = $(this).scrollTop();
    
    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;
    
    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('header,#body-nav,#body-search').removeClass('header-down').addClass('header-up');
    } else {
        // Scroll Up
        if(st < navbarHeight) {
            $('header,#body-nav,#body-search').removeClass('header-up').addClass('header-down');
        }
    }
    
    lastScrollTop = st;
}