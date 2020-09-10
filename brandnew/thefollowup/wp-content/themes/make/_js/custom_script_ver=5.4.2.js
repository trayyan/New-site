$(".eptitle").each(function() {
  var text = $(this).text();
  var part1 = text.substring(0, 12);
  var part2 = text.substring(12);
  $(this).html(part1 + "<hr />" + part2 + "");
})