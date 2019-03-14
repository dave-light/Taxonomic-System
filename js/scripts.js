$( document ).ready(function() {

var container = document.body;

$( document ).ready(function () {
    updateGridWidth();
    $(window).resize(function() {
      updateGridWidth();
    });

    // alert("Hello");
    var Users = Taxonomic.Users;
    var user = Users.find(0);
    Taxonomic.login(user);
    Taxonomic.loadItems();
    var Items = Taxonomic.Items;
    var Tags = Taxonomic.Tags;
     
    
    
    //Enables dropdown in login
    $( '.ui.dropdown' ).dropdown();
    //


    //Enables dropdown on the main view
    var mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {  
            if(mutation.addedNodes[0]    != undefined &&  
            mutation.addedNodes[0].id == "loggedIn") {
                $( '.ui.dropdown' ).dropdown(); 
                mutationObserver.disconnect();
                console.log("enabled drop down.")
            }   
        });
    }); 
        
    mutationObserver.observe(container, {    
        attributes: true,
        childList: true,
        characterData: true
    });   
    //

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
}
