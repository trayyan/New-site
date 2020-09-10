$(document).ready( function masonry_init() {

$('.grid').masonry({
  // options
  itemSelector: '.grid-item',
  columnWidth: '.grid-item',
});

window.onload = masonry_init;

});