 const { Users, Items, Tags } = Taxonomic;

  //Global variables
  var dropdown_selection = "All";
  var items;
  var tags;
  var top_co_tags = new Set();
  var all_tags = [];
  var items_and_tags;
  var filtered_tags = [];
  var filter_type = new Set(["pdf", "image", "video", "audio"]);
  var sort_option = "date";
  var sort_order = "ascending";
  var results = [];
  var search_type = "all";
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

                  onClickModal();

                  // Initialises check boxes in filter menu
                  $('.ui.checkbox').checkbox();

                  // Initialises the tag search box in filter sidebar
                  $('#filter-search-tags').search({source: all_tags});
                  resetFilterForms();
                  setFilterOrderRadioButtons();
                  displayAllResults();
                  updateTopCoTags();

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
            showCorrectFilterOptions();
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
    results = [];
    if(dropdown_selection == "All") {
        $("#main-grid").html("");
        var count = 0;
        items.forEach(function(object){
            var id = object.element.id;
            var image = object.element.picture;
            if (itemMatchesFilters(object.element)) {
              $("#main-grid").append(generateItemCard(id, image));
              results.push(object.element);
              count++;
            }
        });
        if (count == 0) {
          addAllItems();
        }
        tags.forEach(function(object){
            var id = object.element.id;
            var image = "https://www.google.com/url?sa=i&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwj3q4HN4ovhAhUB0xoKHaVbB9AQjRx6BAgBEAU&url=https%3A%2F%2Fwww.tag-games.com%2F&psig=AOvVaw1zYGFBj16qVqcV5NzmHlJt&ust=1553001240587027";
            $("#main-grid").append(generateTagCard(id, image));
            results.push(object.element);
        });
        updateTotalResults();
    }
    else if(dropdown_selection == "Items") {
        $("#main-grid").html("");
        var count = 0;
        items.forEach(function(object){
            var id = object.element.id;
            var image = object.element.picture;
            if (itemMatchesFilters(object.element)) {
              $("#main-grid").append(generateItemCard(id, image));
              count++;
              results.push(object.element);
            }
        });
        if (count == 0) {
          addAllItems();
        }
        updateTotalResults();
    }
    else if(dropdown_selection == "Tags") {
        $("#main-grid").html("");
        tags.forEach(function(object){
            var id = object.element.id;
            var image = "https://www.google.com/url?sa=i&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwj3q4HN4ovhAhUB0xoKHaVbB9AQjRx6BAgBEAU&url=https%3A%2F%2Fwww.tag-games.com%2F&psig=AOvVaw1zYGFBj16qVqcV5NzmHlJt&ust=1553001240587027";
            $("#main-grid").append(generateTagCard(id, image));
            results.push(object.element);
        });
        updateTotalResults();
    }
    sortResults();
  }

  function addAllItems() {
    items.forEach(function(object){
      var id = object.element.id;
      var image = object.element.picture;
      $("#main-grid").append(generateItemCard(id, image));
      results.push(object.element);
    }); 
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

  function showCorrectFilterOptions() {
    if (dropdown_selection == "Tags") {
      $(".item-filter").addClass("disabled");
      $(".tag-filter").removeClass("disabled");
      $("#clear-filters-button").click();
    } else if (dropdown_selection == "Items") {
      $(".item-filter").removeClass("disabled");
      $(".tag-filter").addClass("disabled");
      $("#clear-filters-button").click();
    } else {
      $(".item-filter").removeClass("disabled");
      $(".tag-filter").removeClass("disabled");
    }
  }

  $("#filter-button").click(function(){
    $('.ui.sidebar').sidebar('toggle');
  });

  $("#clear-filters-button").click(function(){
    $("#filter-search-bar").val("");
    $("#error-container").hide();
    clearFilterTable();
    resetFilterForms();
    updateFilters();
  });

  $("#add-tag-filter").click(function(){
    var tag_name = $("#filter-search-bar").val();
    var found = all_tags.find(function(element) {
      return element.title == tag_name;
    });

    if (!found) {
      $("#filter-error-message").html("This tag doesn't exist in the system");
      $("#error-container").show();
    } else if ((tagInFilterList(tag_name) == true)) {
      $("#filter-error-message").html("This tag has already been added to the list");
      $("#error-container").show();
    } else {
      $("#error-container").hide();
      insertTagToFilterList(tag_name);
      $("#filter-search-bar").val("");
    }

  });

  $("#filter-search-bar").focus(function(){
    $("#error-container").hide();
  });

  $( "#tag-rows" ).on( "click", ".filtered-tag", function() {
    var i = filtered_tags.indexOf($(this).text());
    filtered_tags.splice(i,1);
    updateTopCoTags();
    $(this).parents("tr").remove();
    updateEmptyTable();
    updateFilters();
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

  function clearFilterTable() {
    $("#tag-rows").empty();
    updateEmptyTable();
    filtered_tags = [];
    updateTopCoTags();
  }

  function resetFilterForms() {
    $('.ui.form').form('clear');
    $('.ui.checkbox:not(.radio)').checkbox("check", true);
    // $("#date").prop("checked", true);
    // $("#ascending").prop("checked", true);
    // sort_option = "date";
    // sort_order = "ascending";
    $("#date").click();
    $("#ascending").click();
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
    updateTopCoTags();
    updateFilters();
    updateEmptyTable();
  }

  function updateTopCoTags() {
    top_co_tags.clear();
    $("#co-tags-container").empty();
    if (filtered_tags.length == 0) {
      $("#co-tag-title").hide();
      return;
    }
    filtered_tags.forEach(function(object) {
      var co_tags = Tags.cotags(Tags.findAll({"name": object})[0]);
      co_tags.forEach(function(obj) {
        if (!top_co_tags.has(obj.tag.name)) {
          top_co_tags.add(obj); 
        }
      });
    });
    top_co_tags.forEach(function(object) {
      if (filtered_tags.includes(object.tag.name)) {
        top_co_tags.delete(object);
      }
    });
    console.log(top_co_tags);
    var co_tags = Array.from(top_co_tags);
    co_tags.sort((a, b) => (a.count < b.count) ? 1 : -1);
    co_tags.slice(0,5).forEach(function(ob) {
      if ($('.tag').text().indexOf(ob.tag.name) === -1) {
        $("#co-tags-container").append('<a class="ui green tag label">' + ob.tag.name + '</a>');  
      }
    });
    $("#co-tag-title").show();
  }

  $(".filter-type-option").change(function(){
    var type = $(this).attr("id");
    if($(this).is(":checked")) {
      filter_type.add(type);
    } else {
      filter_type.delete(type);
    }
    updateFilters();
  });

  $(".filter-sort-option-radio").change(function(){
    sort_option = $(this).attr("id");
    setFilterOrderRadioButtons();
    $(".filter-sort-option-radio:not(#" + sort_option + ")").prop("checked", false);
    updateFilters();
    sortResults();
  });

  function setFilterOrderRadioButtons() {
    if (sort_option == "date") {
      $("#ascending").next().text("Oldest");
      $("#descending").next().text("Newest");
    } else {
      $("#ascending").next().text("Ascending");
      $("#descending").next().text("Descending");
    }
  }

  $(".filter-sort-order-radio").change(function(){
    sort_order = $(this).attr("id");
    $(".filter-sort-order-radio:not(#" + sort_order + ")").prop("checked", false);
    updateFilters();
    sortResults();
  });

  function updateFilters() {
    displayAllResults();
  }

  function itemMatchesFilters(item) {
    if (filter_type.size > 0 && !filter_type.has(item.type)) {
      return false;
    }
    if (filtered_tags.length > 0) {
      for (var i in filtered_tags) {
        if (!item.tags.includes(filtered_tags[i])) {
          return false;
        }
      }
      return true;
    }
    if (filter_type.has(item.type)) {
      return true;
    }
    return false;
  }

  function sortResults() {
    if (sort_option == "name") {
      if (sort_order == "ascending") {
        results.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1);
      } else {
        results.sort((a, b) => (a.name.toUpperCase() < b.name.toUpperCase()) ? 1 : -1);
      }
    } else if (sort_option == "date") {
      if (sort_order == "ascending") {
        results.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt)) ? 1 : -1);
      } else {
        results.sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt)) ? 1 : -1);
      }
    } else if (sort_option == "attached-items") {

    } else if (sort_option == "co-tags") {
      if (sort_order == "ascending") {
        results.sort((a, b) => (Tags.cotags(a).length > Tags.cotags(b).length) ? 1 : -1);
      } else {
        results.sort((a, b) => (Tags.cotags(a).length < Tags.cotags(b).length) ? 1 : -1);
      }
    }

    $("#main-grid").empty();
    results.forEach(function(object){
      var id = object.id;
      var image = object.picture;
      if (object.hasOwnProperty("tags")) {
        $("#main-grid").append(generateItemCard(id, image));  
      } else {
        $("#main-grid").append(generateTagCard(id, image));
      }
    }); 
    
  }
