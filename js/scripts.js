const { Users, Items, Tags } = Taxonomic;

//Global variables
var dropdown_selection = "All";
var items;
var tags;
var co_tags;
var all_tags = [];
var items_and_tags;
var filtered_tags = [];
var filter_type = [];
var sort_option;
var sort_order;
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
      return '<div class="column"><div id="item-' + id + '" class="ui fluid card item-card" onclick="showItem('+ id + ')"><div class="content"><img class="ui centered image item-image" src="' + image +'" alt=""></div></div></div>';

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

$("#filter-button").click(function(){
  $('.ui.sidebar').sidebar('toggle');
});

$("#clear-filters-button").click(function(){
  $("#filter-search-bar").val("");
  $("#error-container").hide();
  clearFilterTable();
  resetFilterForms();
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

function clearFilterTable() {
  $("#tag-rows").empty();
  updateEmptyTable();
}

function resetFilterForms() {
  $('.ui.form').form('clear');
  $("#date").prop("checked", true);
  $("#ascending").prop("checked", true);
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
function drawAddTagMenu(){

  var tagNames = [];
  var allTags = Tags.search("");
  for(i = 0; i < allTags.length; i++){
    tagNames.push({"title": allTags[i].element.name});
  }
  $("#item-add-tag-menu").append("<div class='ui dropdown search'><div class='ui icon input'><input id='add-tag-item-search' class='prompt' type='text' placeholder='Search Tags to Add...'><i class='search icon'></i></div><div class='results'></div></div>")
  $('.ui.search').search({source: tagNames, on: click});
  let input = $('.ui.search').search('get value');
  //let input = $("#prompt.add-tag-item-search").val();
  console.log(input);
  //addTagToItem();

}

function addTagToItem(itemId, tagId){
  let item = Items.find(itemId);
  let tag = Tags.find(tagId);
  Tags.attach(tag, item);
  $(".ui .modal").prepend("<div class='remove-tag-msg ui message yellow'><div class='header'>Undid Removing Tag From Item</div><p>Tag "+ tag.name  +" readded to item " + item.name +".</p></div>");

}

function undoRemoveTag(itemId, tagId){
  let item = Items.find(itemId);
  let tag = Tags.find(tagId);
  Tags.attach(tag, item);
  $("#item-modal-tags").append("<button id='item-modal-tag-button-" + tagId + "'class='ui button tag label' onclick='removeItemTag(" 
  + item.id + ", "+ tag.id + ", "+ tagId + ")'>" + tag.name + "<i class='delete icon red item-delete-tag-icon'> </i></button>");
  $(".remove-tag-msg").remove();
  $(".ui .modal").prepend("<div class='remove-tag-msg ui message yellow'><div class='header'>Undid Removing Tag From Item</div><p>Tag "+ tag.name  +" readded to item " + item.name +".</p></div>");
}

function removeItemTag(itemId, tagId, buttonId){
 let item = Items.find(itemId);
 let tag = Tags.find(tagId);
  Tags.detach(tag,item);
  $("#item-modal-tag-button-"+buttonId).remove();
  $(".remove-tag-msg").remove();
  $(".ui .modal").prepend("<div class='remove-tag-msg ui message red'><div class='header'>Removed Tag From Item</div><div><p>Tag "+ tag.name  +" removed from item " + item.name 
  + ".</p><button class='ui button tag yellow center aligned' onclick='undoRemoveTag(" + itemId + ", "+ tagId +")'>undo</button></div>");

}

function showItem(id){
  let item = Items.find(id);
  $(".remove-tag-msg").remove();
  $("#item-modal-tags").empty();
  $('#item-modal-image').empty();
  $("#item-modal-name").text(item.name);
  $("#item-modal-desc").text(item.description);    
  let tags = Tags.forItem(item);
  for(var i = 0; i < tags.length; i++){
    $("#item-modal-tags").append("<button id='item-modal-tag-button-" 
    + i + "'class='ui button tag label' onclick='removeItemTag(" + id + ", "+ tags[i].id + ", "+ i 
    + ")'>" + tags[i].name + "<i class='delete icon red item-delete-tag-icon'> </i></button>");
  }
  
  $('#item-modal-image').append("<img src='" + item.picture + "'></img>");
  $('.ui.modal#itemOverlay').modal('show');
 
}

// $("#filter-sidebar input:not(#filter-search-bar)").change(function(){
//   alert($("#filter-sort-order").children().is(":checked").val());
// });
//
// function filterResults() {
//
// }
