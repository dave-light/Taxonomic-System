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

                  displayAllResults();

                  search(); // REMOVE WHEN SEARCH IS FUNCTIONAL.
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
          }
      });
    }


  // Use this function to update the main view if updating it
  // on each single key press is too much.
  // This whole function is only for debugging!!!
  function bindKeys() {
    $( '#search-input' ).keypress(function (e) {

      if (e.key === ' ' || e.keyCode == 13) {

        if(dropdown_selection == "All")   {
          items_and_tags.forEach(function(object){
            console.log(object.element.name);
          });
        }
        else if(dropdown_selection == "Items") {
          items.forEach(function(object){
            console.log(object.element.name);
          });
        }
        else if(dropdown_selection == "Tags")  {
          tags.forEach(function(object){
            console.log(object.element.name);
          });
        }
      }
    })
  }

  function search() {
    // Binds event handler to the search field
    $( "#search-input" ).on('input', function(e){
      var input = $( this ).val();

      // Possibly have to do some tweaking when actually adding the contents
      // to the layout.
      if(dropdown_selection == "All")   {
        items = Items.search(input);
        tags = Tags.search(input);
        items_and_tags = items.concat(tags);
      }
      else if(dropdown_selection == "Items") {
        items = Items.search(input);
      }
      else if(dropdown_selection == "Tags")  {
        tags = Tags.search(input);
      }
    });

  }

  function displayAllResults() {
    items.forEach(function(object){
      var id = object.element.id;
      var image = object.element.picture;
      $("#main-grid").append(generateItemCard(id, image));
    });
    updateTotalResults();
  }

  // This will eventually be updated to take further parameters, such as name
  function generateItemCard(id, image) {
        return '<div class="column"><div id="item-' + id + '" class="ui fluid card item-card" onclick="showItem('+ id + ')"><div class="content"><img class="ui centered image item-image" src="' + image + '" alt=""></div></div></div>';
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

  function setGridWidth(size) {
    $('#main-grid').removeClass('one two three four column grid');
    $('#main-grid').addClass(size + ' column grid');
  }


  function showItem(id){
    let item = Items.find(id);
    $('#item-modal-image').empty();
    $("#item-modal-name").text(item.name);
    $("#item-modal-desc").text(item.description);    
    let tags = Tags.forItem(item);
    for(var i = 0; i < tags.length; i++){
      $("#item-modal-tags").append( "<i class='delete icon item-modal-tag-delete'> " + tags[i].name + " </i>");
    }
    
    $('#item-modal-image').append("<img src='" + item.picture + "'></img>");
    $('.ui.modal#itemOverlay').modal('show');
   
  }


