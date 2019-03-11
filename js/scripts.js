$( document ).ready(function() {
    updateGridWidth();
    $('.ui.dropdown').dropdown();

    $(window).resize(function() {
      updateGridWidth();
    });

});

function updateGridWidth() {
  if ($(window).width() < 700) {
    setGridWidth("one");
  } else if ($(window).width() < 1250) {
    setGridWidth("two");
  } else if ($(window).width() < 1600) {
    setGridWidth("three");
  } else {
   setGridWidth("four");
  }
}

function setGridWidth(size) {
  $('#main-grid').removeClass('one two three four column grid');
  $('#main-grid').addClass(size + ' column grid');
  return;
}
