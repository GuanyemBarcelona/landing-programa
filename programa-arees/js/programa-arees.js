$(function () {

  var democracyHost = "http://programa-test.herokuapp.com",
    apiURL = democracyHost + "/stats/laws";

  var comments = {},
    program = [{
        "id": "area-0",
        "comments": 0,
        "lawId": "54d92283da5b280f0070051b"
    }, {
        "comments": 0,
        "id": "area-1",
        "lawId": "54d923d418fe6663aae5d801"
    }, {
        "comments": 0,
        "id": "area-2",
        "lawId": "54d923df18fe6663aae5d802"
    }, {
        "comments": 0,
        "id": "area-3",
        "lawId": "54d923eb18fe6663aae5d803"
    }];

  function renderSubjectsData() {
    for (var i = 0; i < program.length; i++) {
      $("#" + program[i].id + " .count").html(program[i].comments);
      $("#" + program[i].id + " a").attr("href", democracyHost + "/law/" + program[i].lawId);
    }
  }

  function loadData() {
    $.ajax({
      "url": apiURL,
      "dataType": "json"
    }).done(function(data) {
      // Init comment count
      for (var i = 0; i < data.length; i++) {
        comments[data[i]._id] = data[i].total;
      }

      // Assign comments to program subjects
      for (var i = 0; i < program.length; i++) {
        program[i].comments = comments[program[i].lawId] || 0;
      }
      renderSubjectsData();
    });
  }


  function init() {
      loadData();
  }

  init();
});