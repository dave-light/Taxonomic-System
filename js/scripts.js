//Imports from Taxaonomics API *****************************************************************************************
const { Users, Items, Tags } = Taxonomic;

//Global variables *****************************************************************************************************
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
var currentSelectedItem;

//Initialiser *****************************************************************************************************
$(document).ready(function () {

  var user = Users.find(0);
  Taxonomic.login(user);
  x = Taxonomic.loadItems();
  x.then(function () {
    items = Items.search("");
    tags = Tags.search("");
    tags.forEach(function (obj) {
      all_tags.push({ title: obj.element.name });
    });
    items_and_tags = items.concat(tags);
  });

  //Enables dropdown in login
  $('.ui.dropdown').dropdown();

  // Enables function calls on the main view that require
  // enabled objects.
  // Workaround for the login/logout one page design.
  var mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes[0] != undefined &&
        mutation.addedNodes[0].id == "loggedIn") {

        updateGridWidth();
        $(window).resize(function () {
          updateGridWidth();
        });

        enable_dropdown();

        //Tag Modal stuff
        $('.menu .item').tab();

        onClickModal();

        // Initialises check boxes in filter menu
        $('.ui.checkbox').checkbox();

        // Initialises the tag search box in filter sidebar
        $('#filter-search-tags').search({ source: all_tags });

        $("#item-modal-add-tag-search-area").search({ source: all_tags });
        $('#item-modal-add-tag-search-bar').val("");

        // Initialises the tag search box in filter sidebar
        $('#filter-search-tags').search({ source: all_tags });
        resetFilterForms();
        setFilterOrderRadioButtons();
        showCorrectFilterOptions();
        displayAllResults();
        updateTopCoTags();

        displayAllResults();

        search_listener();

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

//Enable "Search for" dropdown *****************************************************************************************************

function enable_dropdown() {
  $('.ui.dropdown').dropdown({
    action: 'activate',
    onChange: function (value, text, $selectedItem) {
      console.log(text);
      dropdown_selection = text;
      displayAllResults();
      showCorrectFilterOptions();
    }
  });
}

//SEARCH  *****************************************************************************************************
function search_listener() {
  // Binds event handler to the search field
  $("#search-input").on('input', function (e) {

    var input = $(this).val();
    var items_names;
    var items_descs;
    var items2;
    var items3;
    if (dropdown_selection == "All") {
      items_names = Items.search(input);
      items_descs = Items.search2(input);

      items3 = compareAndAppendObjectToList(items_descs, items_names);
      items2 = Items.searchByTag(input);
      items3 = compareAndAppendObjectToList(items2, items3);
      items = items3;

      tags = Tags.search(input);
      items_and_tags = items.concat(tags);
    }

    else if (dropdown_selection == "Items") {
      items_names = Items.search(input);
      items_descs = Items.search2(input);

      items3 = compareAndAppendObjectToList(items_descs, items_names);
      items2 = Items.searchByTag(input);
      items3 = compareAndAppendObjectToList(items2, items3);
      items = items3;
    }

    else if (dropdown_selection == "Tags") {
      tags = Tags.search(input);
    }

    displayAllResults();
  });

}


function compareAndAppendObjectToList(target_list, result_list) {
  var list = result_list;
  target_list.forEach(function (object) {
    if (!result_list.some(item => _.isEqual(item.element, object.element))) {
      list = list.concat(object);
    }
  });
  return list;
}

function displayAllResults() {
  results = [];
  if (dropdown_selection == "All") {
    $("#main-grid").html("");
    var count = 0;
    items.forEach(function (object) {
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
    if (top_co_tags.size == 0) {
      addAllTags();
    } else {
      var co_tags = Array.from(top_co_tags);
      co_tags.forEach(function (object) {
        var id = object.tag.id;
        var tagName = object.tag.name;
        $("#main-grid").append(generateTagCard(id, tagName));
        results.push(object.tag);
      });
    }
  }
  else if (dropdown_selection == "Items") {
    $("#main-grid").html("");
    var count = 0;
    items.forEach(function (object) {
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
  }

  else if (dropdown_selection == "Tags") {
    $("#main-grid").html("");
    tags.forEach(function (object) {
      var id = object.element.id;
      var tagName = object.element.name;
      $("#main-grid").append(generateTagCard(id, tagName));
      results.push(object.element);
    });
  }
  updateTotalResults();
  sortResults();
}

function addAllItems() {
  items.forEach(function (object) {
    var id = object.element.id;
    var image = object.element.picture;
    $("#main-grid").append(generateItemCard(id, image));
    results.push(object.element);
  });
}

function addAllTags() {
  tags.forEach(function (object) {
    var id = object.element.id;
    var tagName = object.element.name;
    $("#main-grid").append(generateTagCard(id, tagName));
    results.push(object.element);
  });
}

// Generate html for tag and/or item cards *****************************************************************************************************
function generateItemCard(id, image) {
  return '<div class="column"><div id="item-' + id + '" class="ui fluid card item-card" onclick="showItem(' + id + ')"><div class="content"><img class="ui centered image item-image" src="' + image + '" alt=""></div></div></div>';

}

function generateTagCard(id, tagName) {
  return '<div class="column"><div id="tag-' + id + '" class="ui fluid card item-card"><div class="content"><img class="ui centered image item-image" src="https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg"><h1 id="centeredTag">' + '<span class="hashColor">#</span>' + tagName + '</h1></div></div></div>';
}

function updateTotalResults() {
  $("#total-results").html($("#main-grid .column").length);
}

//Make cards responsive to screen sizes *****************************************************************************************************
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

//FILTER %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$("#filter-button").click(function () {
  $('.ui.sidebar').sidebar('toggle');
});

$("#clear-filters-button").click(function () {
  $("#filter-search-bar").val("");
  $("#error-container").hide();
  clearFilterTable();
  resetFilterForms();
});

$("#add-tag-filter").click(function () {
  var tag_name = $("#filter-search-bar").val();
  var found = all_tags.find(function (element) {
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

$("#filter-search-bar").focus(function () {
  $("#error-container").hide();
});

$("#tag-rows").on("click", ".filtered-tag", function () {
  var i = filtered_tags.indexOf($(this).text());
  filtered_tags.splice(i, 1);
  $(this).parents("tr").remove();
  updateEmptyTable();
});

$("#clear-filters-button").click(function () {
  $("#filter-search-bar").val("");
  $("#error-container").hide();
  clearFilterTable();
  resetFilterForms();
  updateFilters();
});


function updateEmptyTable() {
  var empty_table = '<tr id="empty-tag-list" class="center aligned">' + '<td>No tags currently filtered</td></tr>';
  if (tagFilterListIsEmpty()) {
    $("#tag-rows").html(empty_table);
  } else {
    $("#empty-tag-list").remove();
  }
}

// function clearFilterTable() {
//   $("#tag-rows").empty();
//   updateEmptyTable();
// }



function clearFilterTable() {
  $("#tag-rows").empty();
  updateEmptyTable();
  filtered_tags = [];
  updateTopCoTags();
}

// function resetFilterForms() {
//   $('.ui.form').form('clear');
//   $("#date").prop("checked", true);
//   $("#ascending").prop("checked", true);
// }

function resetFilterForms() {
  $('.ui.form').form('clear');
  $('.ui.checkbox:not(.radio)').checkbox("check", true);
  $("#date").click();
  $("#ascending").click();
}

function tagFilterListIsEmpty() {
  return $("#tag-rows").children().length == 0;
}

function tagInFilterList(tag) {
  var flag = false;
  $(".tag-entry").each(function () {
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

function showCorrectFilterOptions() {
  if (dropdown_selection == "Tags") {
    $(".item-filter").addClass("disabled");
    $(".tag-filter").removeClass("disabled");
  } else if (dropdown_selection == "Items") {
    $(".item-filter").removeClass("disabled");
    $(".tag-filter").addClass("disabled");
  } else {
    $(".item-filter").removeClass("disabled");
    $(".tag-filter").addClass("disabled");
  }
  $("#clear-filters-button").click();
}

// ITEM MODAL ***************************************************************************************************************

function addTagToItem() {
  var searchVal = $("#item-modal-add-tag-search-bar").val();
  var matchingTags = Tags.search(searchVal);
  var tagId;
  $("#item-tag-change-message").empty();
  for (var i = 0; i < matchingTags.length; i++) {
    if (matchingTags[i].element.name === searchVal) {
      tagId = matchingTags[i].element.id;
    }
  }

  if (tagId == null) {
    $("#item-tag-change-message").empty();
    $("#item-tag-change-message").prepend("<div class='remove-tag-msg ui message red'><div class='header'>Tag Does Not Exist</div><p>" + searchVal + " is not a tag.</p></div>");
  } else {
    let item = Items.find(currentSelectedItem);
    let tag = Tags.find(tagId);
    $('#item-modal-add-tag-search-bar').val("");
    if (Tags.attach(tag, item)) {
      $("#item-tag-change-message").prepend("<div class='remove-tag-msg ui message green'><div class='header'>Added Tag To Item</div><p>Tag " + tag.name + " added to item " + item.name + ".</p></div>");
      $("#item-modal-tags").append("<button id='item-modal-tag-button-" + tagId + "'class=' remove-item-tag-button ui button tag label' onclick='removeItemTag("
        + item.id + ", " + tag.id + ", " + tagId + ")'>" + tag.name + "<i class='delete icon red item-delete-tag-icon'> </i></button>");
    } else {
      $("#item-tag-change-message").prepend("<div class='remove-tag-msg ui message yellow'><div class='header'>Tag Already Attached to Item</div><p>Tag "
        + tag.name + " already attached to item " + item.name + ".</p></div>");

    }
  }
}



function undoRemoveTag(itemId, tagId) {
  let item = Items.find(itemId);
  let tag = Tags.find(tagId);
  Tags.attach(tag, item);
  $("#item-modal-tags").append("<button id='item-modal-tag-button-" + tagId + "'class='ui button tag label remove-item-tag-button' onclick='removeItemTag("
    + item.id + ", " + tag.id + ", " + tagId + ")'>" + tag.name + "<i class='delete icon red item-delete-tag-icon'> </i></button>");
  $(".remove-tag-msg").remove();
  $("#item-tag-change-message").prepend("<div class='remove-tag-msg ui message yellow'><div class='header'>Undid Removing Tag From Item</div><p>Tag " + tag.name + " readded to item " + item.name + ".</p></div>");
}

function removeItemTag(itemId, tagId, buttonId) {
  let item = Items.find(itemId);
  let tag = Tags.find(tagId);
  Tags.detach(tag, item);
  $("#item-modal-tag-button-" + buttonId).remove();
  $(".remove-tag-msg").remove();
  $("#item-tag-change-message").prepend("<div class='remove-tag-msg ui message red'><div class='header'>Removed Tag From Item</div><div><p>Tag " + tag.name + " removed from item " + item.name
    + ".</p><button class='ui right floated button tag yellow ' onclick='undoRemoveTag(" + itemId + ", " + tagId + ")'>undo</button><br><br></div>");

}

function showItem(id) {
  let item = Items.find(id);
  currentSelectedItem = id;
  $(".remove-tag-msg").remove();
  $(".remove-tag-msg").remove();
  $("#item-modal-tags").empty();
  $('#item-modal-image').empty();
  $("#item-modal-name").text("Item: " + item.name);
  $("#item-modal-desc").text(item.description);
  let tags = Tags.forItem(item);
  for (var i = 0; i < tags.length; i++) {
    $("#item-modal-tags").append("<button id='item-modal-tag-button-"
      + i + "'class='ui button tag label remove-item-tag-button' onclick='removeItemTag(" + id + ", " + tags[i].id + ", " + i
      + ")'>" + tags[i].name + "<i class='delete icon red item-delete-tag-icon'> </i></button>");
  }

  $('#item-modal-image').append("<img src='" + item.picture + "'></img>");
  $('.ui.modal#itemOverlay').modal('show');

}

//Tag Modal ***************************************************************************************************************

function onClickModal() {
  var id;
  var tag_id;
  var tag;

  $("#main-grid").on('click', '.column', function () {
    id = $(this).children()[0].id;
    if (id.indexOf("tag") >= 0) {

      tag_id = parseInt(id.substring(id.indexOf("-") + 1));
      console.log(tag_id);

      tag = Tags.find(tag_id);
      console.log(tag);


      if (Tags.isFlagged(tag)) {
        $('#flag').text("Un-flag");
      } else {
        $('#flag').text("Flag");
      }

      populateTagInfo(tag);

      //Resets tab position
      $('.ui.modal#tagsOverlay').modal({
        onHidden: function () {
          $('.menu .item').tab('change tab', 'first');
        }
      }).modal('show');

      //Initial history
      setHistory(tag);


      setManageTag(tag);
      mapTag(tag);
    }
  });


  $('#flag').on('click', function () {
    if ($('#flag').text() == "Flag") {
      console.log("Flagged.");
      Tags.flag(tag);
      $('#flag').text("Un-flag");
    } else {
      console.log("Un-flagged.");
      Tags.unflag(tag);
      $('#flag').text("Flag");
    }


    setHistory(tag);
    console.log(Tags.history(tag));
  });

}

function mapTag(tag) {
  var tag_names = [];

  tags.forEach(function (e) {
    tag_names.push({ "name": e.element.name, "value": e.element.name });
  });

  $('.ui.dropdown.map-dropdown').dropdown({
    values: tag_names
  });

  $('#map-save').on('click', function () {
    $('.ui.dropdown.map-dropdown').dropdown("get value");
    var values = $('.ui.search.dropdown.map-dropdown');

  });
  $('#map-tag-cancel').on('click', function () {
    $('.ui.dropdown.map-dropdown').dropdown(
      "clear"
    );
  });


  console.log($(this));
}

function populateTagInfo(tag) {
  //Clear and populate fields
  $('#modal-tag-title').empty().text("Tag: " + tag.name);
  $('#modal-tag-id').empty().text(tag.id);
  $('#modal-tag-name').empty().text(tag.name);
  $('#modal-tag-description').empty().text(tag.description);
  $('#modal-tag-creator').empty().text(tag.creator.name);
  $('#modal-tag-created').empty().text(tag.createdAt);
  if (tag.status) {
    $('#modal-tag-status').empty().text("open");
  } else {

    $('#modal-tag-status').empty().text("closed");
  }

}

function setManageTag(tag) {
  //tag.element.name
  //tag.element.description

  $('#edit-tag-name').val(tag.name);
  $('#edit-tag-description').val(tag.description);

  //onchange on name to check if the name already exists
  console.log(tag);
  $('#edit-tag-save').on('click', function () {
    tag.name = $('#edit-tag-name').val();
    tag.description = $('#edit-tag-description').val();
    Tags.update(tag);
    populateTagInfo(tag);
    displayAllResults();
  });

  $('#edit-tag-cancel').on('click', function () {
    $('#edit-tag-name').val(tag.name);
    $('#edit-tag-description').val(tag.description);
  });
}

function setHistory(tag) {
  console.log(Tags.history(tag));
  var history = Tags.history(tag);

  $('tbody#history-body').empty();
  history.slice().reverse().forEach(function (element) {
    //History ID var
    var history_id = element.id;
    //Description
    var description = element.payload;
    //Action by
    var author = element.creator.name;
    //Time
    var time = element.createdAt.split(" GMT")[0];
    $('tbody#history-body').append('\
                <tr>\
                <td data-label="History ID">'+ history_id + '</td>\
                <td data-label="Description">'+ description + '</td>\
                <td data-label="Action by">' + author + '</td>\
                <td data-label="Time">' + time + '</td>\
                </tr>\
                ');
  });
}


$("#tag-rows").on("click", ".filtered-tag", function () {
  var i = filtered_tags.indexOf($(this).text());
  filtered_tags.splice(i, 1);
  updateTopCoTags();
  $(this).parents("tr").remove();
  updateEmptyTable();
  updateFilters();
});


// Create new tag ********************************************************************************************************
$("#add-tag").click(function () {
  $('#name-id').val("");
  $('#description-id').val("");
  $('#createNewTag').modal('show');
});

$('.ui.form').form({
  fields: {
    name: {
      identifier: 'name',
      rules: [
        {
          type: 'empty',
          prompt: 'Please enter tag name'
        }
      ]
    }
  }
});

$('#createNewTagButton').click(function () {
  let name = $('#name-id').val();
  let description = $('#description-id').val();
  let newTag =
    Tags.create({
      'name': name,
      'description': description
    });
  all_tags.push({ title: newTag.name });
  tags.push({ key: "name", element: newTag });
  $('#item-modal-add-tag-search-area').search({ source: all_tags });
  $('#filter-search-tags').search({ source: all_tags });
  $('#createNewTag').hide();
});

// Filter mechanism code ********************************************************************************************************

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
  filtered_tags.forEach(function (object) {
    var co_tags = Tags.cotags(Tags.findAll({ "name": object })[0]);
    co_tags.forEach(function (obj) {
      if (!top_co_tags.has(obj.tag.name)) {
        top_co_tags.add(obj);
      }
    });
  });
  top_co_tags.forEach(function (object) {
    if (filtered_tags.includes(object.tag.name)) {
      top_co_tags.delete(object);
    }
  });
  console.log(top_co_tags);
  var co_tags = Array.from(top_co_tags);
  co_tags.sort((a, b) => (a.count < b.count) ? 1 : -1);
  co_tags.slice(0, 5).forEach(function (ob) {
    if ($('.co-tag').text().indexOf(ob.tag.name) === -1) {
      $("#co-tags-container").append('<a class="ui green tag label co-tag">' + ob.tag.name + '</a>');
    }
  });
  $("#co-tag-title").show();
}

$("#co-tags-container").on('click', ".co-tag", function () {
  insertTagToFilterList($(this).text());
});

$(".filter-type-option").change(function () {
  var type = $(this).attr("id");
  if ($(this).is(":checked")) {
    filter_type.add(type);
  } else {
    filter_type.delete(type);
  }
  updateFilters();
});

$(".filter-sort-option-radio").change(function () {
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

$(".filter-sort-order-radio").change(function () {
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
  } else if (sort_option == "associated-items") {
    if (sort_order == "ascending") {
      results.sort((a, b) => (numberOfAssociatedItems(a) > numberOfAssociatedItems(b)) ? 1 : -1);
    } else {
      results.sort((a, b) => (numberOfAssociatedItems(a) < numberOfAssociatedItems(b)) ? 1 : -1);
    }
  } else if (sort_option == "co-tags") {
    if (sort_order == "ascending") {
      results.sort((a, b) => (Tags.cotags(a).length > Tags.cotags(b).length) ? 1 : -1);
    } else {
      results.sort((a, b) => (Tags.cotags(a).length < Tags.cotags(b).length) ? 1 : -1);
    }
  }

  $("#main-grid").empty();
  results.forEach(function (object) {
    var id = object.id;
    var image = object.picture;
    if (object.hasOwnProperty("tags")) {
      $("#main-grid").append(generateItemCard(id, image));
    } else {
      var tag_name = object.name;
      $("#main-grid").append(generateTagCard(id, tag_name));
    }
  });

}

function numberOfAssociatedItems(tag) {
  var count = 0;
  items.forEach(function (object) {
    if (Tags.attached(tag, object.element) == true) {
      count++;
    }
  });
  return count;
}
