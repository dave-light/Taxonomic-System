  const { Users, Items, Tags } = Taxonomic;

  //Global variables
  var dropdown_selection = "All";
  var items;
  var tags;
  var co_tags;
  var all_tags = [];
  var filtered_tags = [];
  var items_and_tags;
  var container = document.body;

  $( document ).ready(function () {

      var user = Users.find(0);
      Taxonomic.login(user);
      x = Taxonomic.loadItems();
      x.then(function() {
          items              = Items.search("");
          tags               = Tags.search("");
          tags.forEach(function(obj) {
            all_tags.push({ title: obj.element.name});
          });
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

                  // Initialises check boxes in filter menu
                  $('.ui.checkbox').checkbox();

                  // Initialises the tag search box in filter sidebar
                  $('#filter-search-tags').search({source: all_tags});

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
        return '<div class="column"><div id="item-' + id + '" class="ui fluid card item-card"><div class="content"><img class="ui centered image item-image" src="' + image + '" alt=""></div></div></div>';
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

  $("#filter-button").click(function(){
    $('.ui.sidebar').sidebar('toggle');
  });

  $("#add-tag-filter").click(function(){
    var tag_name = $("#filter-search-bar").val();
    var found = all_tags.find(function(element) {
      return element.title == tag_name;
    });
    // alert(tag_name);
    // alert(tagInFilterList(tag_name));
    if (found && (tagInFilterList(tag_name) != true)) {
      insertTagToFilterList(tag_name);
      $("#filter-search-bar").val("");
    }
  });

  $( "#tag-rows" ).on( "click", ".filtered-tag", function() {
    var i = filtered_tags.indexOf($(this).text());
    filtered_tags.splice(i,1);
    $(this).parents("tr").remove();
    updateEmptyTable();
  });

  function updateEmptyTable() {
    var empty_table = '<tr id="empty-tag-list" class="center aligned">' +
    '<td>No tags currently filtered</td></tr>';
    if (tagFilterListIsEmpty()) {
      $("#tag-rows").html(empty_table);
    } else {
      $("#empty-tag-list").remove();
    }
  }

  function tagFilterListIsEmpty() {
    return $("#tag-rows").children().length == 0;
  }

  function tagInFilterList(tag) {
    var flag = false;
    $(".tag-entry").each(function() {
        if (tag == $(this).text()) {
          flag = true;
        }
    });
    return flag;
  }

  function insertTagToFilterList(tag) {
    var tag_filter = '<tr class="center aligned"><td>' +
    '<a class="ui tag label filtered-tag"><span class="tag-entry">' + tag +
    '</span><i class="red close icon"></i></a></td></tr>';
    $("#tag-rows").append(tag_filter);
    filtered_tags.push(tag);
    updateEmptyTable();
  }
