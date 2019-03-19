 const { Users, Items, Tags } = Taxonomic;

  //Global variables
  var dropdown_selection = "All";
  var items;
  var tags;
  var co_tags;
  var items_and_tags;
  var container = document.body;

  $( document ).ready(function () {

      var user = Users.find(0);
      Taxonomic.login(user);        
      x = Taxonomic.loadItems();
      x.then(function() {
          items              = Items.search("");
          tags               = Tags.search("");
          items_and_tags     = items.concat(tags);
        });

      //Enables dropdown in login
      $( '.ui.dropdown' ).dropdown();

      // Enables function calls on the main view that require
      // enabled objects.
      // Workaround for the login/logout one page design.
      var mutationObserver = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
              if(mutation.addedNodes[0] != undefined &&
              mutation.addedNodes[0].id == "loggedIn") {

                  updateGridWidth();
                  $(window).resize(function() {
                    updateGridWidth();
                  });

                  bindKeys();
                  enable_dropdown();
                  onClickModal();
                  displayAllResults();

                  search_listener(); // REMOVE WHEN SEARCH IS FUNCTIONAL.
                            // stored in -> items
                            //              tags
                            //              items_and_tags
                            // depending on search

                  mutationObserver.disconnect();

                  // Debugging logs.
                  console.log("Grid activated.");
                  console.log("Key bindings activated.");
                  console.log("Dropdown activated.");
                  console.log("Search activated.");

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

  function enable_dropdown() {
      $( '.ui.dropdown' ).dropdown({
          action: 'activate',
          onChange: function(value, text, $selectedItem) {
          console.log(text);
          dropdown_selection = text;
              displayAllResults();
          }
      });
  }


  // Use this function to update the main view if updating it
  // on each single key press is too much.
  // This whole function is only for debugging!!!
  function bindKeys() {
    $( '#search-input' ).keypress(function (e) {

        if (e.keyCode == 13) {
            displayAllResults();
        }
        else if(e.keyCode == 32) {
            displayAllResults();
        }

    });
  }

  function search_listener() {
    // Binds event handler to the search field
      $( "#search-input" ).on('input', function(e){

        var input = $( this ).val();
        var items_names;
        var items_descs;
        var items2;
        var items3;
        if(dropdown_selection == "All") {
            items_names = Items.search(input);
            items_descs  = Items.search2(input);

            items3 = compareAndAppendObjectToList(items_descs, items_names);
            items2 = Items.searchByTag(input);
            items3 = compareAndAppendObjectToList(items2, items3);
            items  = items3;
            
            tags = Tags.search(input);
            items_and_tags = items.concat(tags);
        }

        else if(dropdown_selection == "Items") {
            items_names = Items.search(input);
            items_descs  = Items.search2(input);

            items3 = compareAndAppendObjectToList(items_descs, items_names);
            items2 = Items.searchByTag(input);
            items3 = compareAndAppendObjectToList(items2, items3);
            items = items3;
        }
      
      else if(dropdown_selection == "Tags")  {
        tags = Tags.search(input);
      }

        displayAllResults();
    });

  }


function compareAndAppendObjectToList(target_list, result_list) {
    var list = result_list;
    target_list.forEach(function (object) {
        if(!result_list.some(item => _.isEqual(item.element, object.element))) {
            list = list.concat(object);
        }
    });
    return list;
}
function displayAllResults() {
    if(dropdown_selection == "All") {
        $("#main-grid").html("");

        items.forEach(function(object){
            var id = object.element.id;
            var image = object.element.picture;
            $("#main-grid").append(generateItemCard(id, image));
        });
        tags.forEach(function(object){
            var id = object.element.id;
            var image = "https://www.google.com/url?sa=i&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwj3q4HN4ovhAhUB0xoKHaVbB9AQjRx6BAgBEAU&url=https%3A%2F%2Fwww.tag-games.com%2F&psig=AOvVaw1zYGFBj16qVqcV5NzmHlJt&ust=1553001240587027";
            $("#main-grid").append(generateTagCard(id, image));
        });

        updateTotalResults();
    }
    else if(dropdown_selection == "Items") {
        $("#main-grid").html("");
        items.forEach(function(object){
            var id = object.element.id;
            var image = object.element.picture;
            $("#main-grid").append(generateItemCard(id, image));
        });
        updateTotalResults();
    }
    else if(dropdown_selection == "Tags") {
        $("#main-grid").html("");
        tags.forEach(function(object){
            var id = object.element.id;
            var image = "https://www.google.com/url?sa=i&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwj3q4HN4ovhAhUB0xoKHaVbB9AQjRx6BAgBEAU&url=https%3A%2F%2Fwww.tag-games.com%2F&psig=AOvVaw1zYGFBj16qVqcV5NzmHlJt&ust=1553001240587027";
            $("#main-grid").append(generateTagCard(id, image));
        });
        updateTotalResults();
    }
  }

  // This will eventually be updated to take further parameters, such as name
  function generateItemCard(id, image) {
        return '<div class="column"><div id="item-' + id + '" class="ui fluid card item-card"><div class="content"><img class="ui centered image item-image" src="' + image + '" alt=""></div></div></div>';
  }

function generateTagCard(id, image) {
    return '<div class="column"><div id="tag-' + id + '" class="ui fluid card item-card"><div class="content"><img class="ui centered image item-image" src="' + image + '" alt=""></div></div></div>';
}

  function updateTotalResults() {
      $("#total-results").html($("#main-grid .column").length);
  }

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
function showTag(id){
    let tag = Tags.find(id);
    
    //Stuff on the modal
    $(".remove-tag-msg").remove();
    $('#tag-modal-image').empty();

    //Title
    $("#tag-modal-name").text(tag.name);

    //Description
    $("#tag-modal-desc").text(tag.description);

    
    //Appends image
    $('#tag-modal-image').append("<img src=></img>");
    $('.ui.modal#tagOverlay').modal('show');

}

function onClickModal() {
    var id;
    var tag_id;
    var tag;

    $("#main-grid").on('click', '.column', function() {
        id = $(this).children()[0].id;
        if(id.indexOf("tag") >= 0) {

            tag_id = parseInt(id.substring(id.indexOf("-") + 1));
            console.log(tag_id);

            tag = Tags.find(tag_id);
            console.log(tag);


            if(Tags.isFlagged(tag)){
                $('#flag').text("Un-flag");
            }else{
                $('#flag').text("Flag");
            }



            //Stuff on the modal
            $(".remove-tag-msg").remove();
            $('#tag-modal-image').empty();

            //Title
            $("#tag-modal-name").text(tag.name);

            //Description
            $("#tag-modal-desc").text(tag.description);


            //Appends image
            $('#tag-modal-image').append("<img src=></img>");
            $('.ui.modal#tagsOverlay').modal('show');
        }
    });


    $('#flag').on('click', function() {
        if($('#flag').text() == "Flag"){
            console.log("Flagged.");
            Tags.flag(tag);
            $('#flag').text("Un-flag");
        }else{
            console.log("Un-flagged.");
            Tags.unflag(tag);
            $('#flag').text("Flag");
        }


        console.log(Tags.history(tag));
    });
}
  function setGridWidth(size) {
    $('#main-grid').removeClass('one two three four column grid');
    $('#main-grid').addClass(size + ' column grid');
}
