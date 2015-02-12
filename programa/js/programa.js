$(function () {

  var democracyHost = "http://programa-test.herokuapp.com",
    apiURL = democracyHost + "/stats/laws";

  // Dummy data
  var program = [],
    districts = [],
    comments = {};

  function renderSubjectsData() {
    for (var i = 0; i < program.length; i++) {
      $("#" + program[i].id + " .count").html(program[i].comments);
      $("#" + program[i].id + " a").attr("href", democracyHost + "/law/" + program[i].lawId);
    }
  }

  function renderDistrictNeighborhoods(d) {
    $(".pgm-diagnosis-list ul").empty();
    var distNeigTemplate = tmpl("districtNeighborhood_tmpl"),
      neigTemplate = tmpl("neighborhood_tmpl");

    var distNeigHTML = distNeigTemplate({
      "comments": districts[d].ownComments,
      "district": districts[d].name,
      "lawURL": democracyHost + "/law/" + districts[d].lawId
    });
    $(".pgm-diagnosis-list ul").append(distNeigHTML);

    for (var i = 0; i < districts[d].neighborhoods.length; i++) {
      var neigHTML = neigTemplate({
        "comments": districts[d].neighborhoods[i].comments,
        "neighborhood": districts[d].neighborhoods[i].name,
        "lawURL": democracyHost + "/law/" + districts[d].neighborhoods[i].lawId
      });
      $(".pgm-diagnosis-list ul").append(neigHTML);
      $("#counter-" + districts[d].neighborhoods[i].id +
        " tspan").html(districts[d].neighborhoods[i].comments);
    }
  }

  function renderDistrictsData(d) {
    $(".pgm-diagnosis-list ul").empty();
    for (var i = 0; i < districts.length; i++) {
      renderDistrictData(i);
    }
  }

  function renderDistrictData(d) {
    var distTemplate = tmpl("district_tmpl");

    var distHTML = distTemplate({
      "comments": districts[d].comments,
      "districtId": districts[d].id,
      "district": districts[d].name,
      "lawURL": democracyHost + "/law/" + districts[d].lawId
    });

    $(".pgm-diagnosis-list ul").append(distHTML);
    $("#counter-" + districts[d].id + " tspan").html(districts[d].comments);
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

      // Assign comments to districts and neighborhoods
      for (var i = 0; i < districts.length; i++) {
        var disctrictComments = comments[districts[i].lawId] || 0,
          neighborhoodsCount = 0;
        for (var j = 0; j < districts[i].neighborhoods.length; j++) {
          districts[i].neighborhoods[j].comments = comments[districts[i].neighborhoods[j].lawId] || 0;
          neighborhoodsCount += districts[i].neighborhoods[j].comments;
        }
        districts[i].comments = neighborhoodsCount + disctrictComments;
        districts[i].ownComments = disctrictComments;
      }

      renderDistrictsData();
    });
  }


  function bindDiagnosis() {
    $("#global-map").on("click", "path", function(evt) {
      console.log("Show district: %s", evt.currentTarget.id);
      var idx = districtIndex(evt.currentTarget.id);
      if(idx !== undefined) {
        renderDistrictNeighborhoods(idx);
        showDiagnosisMap(idx);
      }
    });

    $(".pgm-diagnosis-map-entry").not("#global-map").on("click", "path", function(evt) {
      var lawId = neighborhoodLaw(evt.currentTarget.id);
      console.log("Navigate neighborhood: %s", lawId);
      if(lawId !== undefined) {
        window.location = democracyHost + "/law/" + lawId;
      }
    });

    $(".pgm-back-global").on("click", function(evt) {
      showDiagnosisMap();
      renderDistrictsData();
    });

    $(".pgm-diagnosis-list").on("click", ".pgm-neighborhood-drill-down", function(evt) {
      var districtId = $(evt.currentTarget).data("id");
      console.log("Show: %s", districtId);
      var idx = districtIndex(districtId);
      if(idx !== undefined) {
        renderDistrictNeighborhoods(idx);
        showDiagnosisMap(idx);
      }
    });
  }

  function showDiagnosisMap(idx) {
    $(".pgm-diagnosis-map-entry").addClass("pgm-hidden");
    if(idx === undefined) {
      $("#global-map").removeClass("pgm-hidden");
    } else {
      $("#" + districts[idx].id + "-map").removeClass("pgm-hidden");
    }
  }

  function neighborhoodLaw(neighborhoodId) {
    for (var i = 0; i < districts.length; i++) {
      for (var j = 0; j < districts[i].neighborhoods.length; j++) {
        if(districts[i].neighborhoods[j].id === neighborhoodId) {
          return districts[i].neighborhoods[j].lawId;
        }
      }
    }
    return;
  }

  function districtIndex(districtId) {
    for (var i = 0; i < districts.length; i++) {
      if(districts[i].id === districtId) {
        return i;
      }
    }
    return;
  }

  function init() {
      //loadProgramSubjects();
      loadData();
      bindDiagnosis();
  }

  var cache = {};
  function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };

  districts = [{
      "comments": 0,
      "ownComments": 0,
      "id": "ciutat-vella",
      "lawId": "54d889bc1eaee3455707c881",
      "name": "Ciutat Vella",
      "neighborhoods": [{
          "name": "La Barceloneta",
          "comments": 0,
          "id": "barceloneta",
          "lawId": "54d7909032446bbc5218b966"
      }, {
          "name": "El Gòtic",
          "comments": 0,
          "id": "gotic",
          "lawId": "54d7909032446bbc5218b967"
      }, {
          "name": "El Raval",
          "comments": 0,
          "id": "raval",
          "lawId": "54d7909032446bbc5218b968"
      }, {
          "name": "Sant Pere, Santa Caterina i la Ribera",
          "comments": 0,
          "id": "sant-pere",
          "lawId": "54d7909032446bbc5218b969"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "eixample",
      "lawId": "54d889bc1eaee3455707c87e",
      "name": "Eixample",
      "neighborhoods": [{
          "name": "L'Antiga Esquerra de l'Eixample",
          "comments": 0,
          "id": "antiga-esquerra",
          "lawId": "54d790b54d0522be52c190f4"
      }, {
          "name": "La Nova Esquerra de l'Eixample",
          "comments": 0,
          "id": "nova-esquerra",
          "lawId": "54d790b54d0522be52c190f5"
      }, {
          "name": "La Dreta de l'Eixample",
          "comments": 0,
          "id": "dreta-eixample",
          "lawId": "54d790b54d0522be52c190f6"
      }, {
          "name": "Fort Pienc",
          "comments": 0,
          "id": "fort-pienc",
          "lawId": "54d790b54d0522be52c190f7"
      }, {
          "name": "Sagrada Família",
          "comments": 0,
          "id": "sagrada-familia",
          "lawId": "54d790b54d0522be52c190f8"
      }, {
          "name": "Sant Antoni",
          "comments": 0,
          "id": "sant-antoni",
          "lawId": "54d790b54d0522be52c190f9"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "gracia",
      "lawId": "54d889bc1eaee3455707c880",
      "name": "Gràcia",
      "neighborhoods": [{
          "name": "Vila de Gràcia",
          "comments": 0,
          "id": "vila-gracia",
          "lawId": "54d790c1a946bebf52e8a3ba"
      }, {
          "name": "Camp d'en Grassot i Gràcia Nova",
          "comments": 0,
          "id": "camp-grassot",
          "lawId": "54d790c1a946bebf52e8a3bb"
      }, {
          "name": "La Salut",
          "comments": 0,
          "id": "salut",
          "lawId": "54d790c1a946bebf52e8a3bc"
      }, {
          "name": "El Coll",
          "comments": 0,
          "id": "coll",
          "lawId": "54d790c1a946bebf52e8a3bd"
      }, {
          "name": "Vallcarca i els Penitents",
          "comments": 0,
          "id": "vallcarca-penitents",
          "lawId": "54d790c1a946bebf52e8a3be"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "horta-guinardo",
      "lawId": "54d889bc1eaee3455707c883",
      "name": "Horta Guinardó",
      "neighborhoods": [{
          "name": "El Baix Guinardó",
          "comments": 0,
          "id": "baix-guinardo",
          "lawId": "54d790ca9ecd0ec052ba1fa7"
      }, {
          "name": "El Guinardó",
          "comments": 0,
          "id": "guinardo",
          "lawId": "54d790ca9ecd0ec052ba1fa8"
      }, {
          "name": "Can Baró",
          "comments": 0,
          "id": "can-baro",
          "lawId": "54d790ca9ecd0ec052ba1fa9"
      }, {
          "name": "El Carmel",
          "comments": 0,
          "id": "carmel",
          "lawId": "54d790ca9ecd0ec052ba1fab"
      }, {
          "name": "Font d'en Fargues",
          "comments": 0,
          "id": "font-fargues",
          "lawId": "54d790ca9ecd0ec052ba1faa"
      }, {
          "name": "Horta",
          "comments": 0,
          "id": "horta",
          "lawId": "54d790ca9ecd0ec052ba1fac"
      }, {
          "name": "La Clota",
          "comments": 0,
          "id": "clota",
          "lawId": "54d790ca9ecd0ec052ba1fad"
      }, {
          "name": "Montbau",
          "comments": 0,
          "id": "montbau",
          "lawId": "54d790ca9ecd0ec052ba1fae"
      }, {
          "name": "Sant Genís dels Agudells",
          "comments": 0,
          "id": "sant-genis",
          "lawId": "54d790ca9ecd0ec052ba1faf"
      }, {
          "name": "La Teixonera",
          "comments": 0,
          "id": "teixonera",
          "lawId": "54d790ca9ecd0ec052ba1fb0"
      }, {
          "name": "La Vall d'Hebron",
          "comments": 0,
          "id": "vall-hebron",
          "lawId": "54d790ca9ecd0ec052ba1fb1"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "les-corts",
      "lawId": "54d889bc1eaee3455707c884",
      "name": "Les Corts",
      "neighborhoods": [{
          "name": "Les Corts",
          "comments": 0,
          "id": "corts",
          "lawId": "54d790dda74eebc152c9af61"
      }, {
          "name": "La Maternitat i Sant Ramon",
          "comments": 0,
          "id": "maternitat",
          "lawId": "54d790dda74eebc152c9af62"
      }, {
          "name": "Pedralbes",
          "comments": 0,
          "id": "pedralbes",
          "lawId": "54d790dda74eebc152c9af63"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "nou-barris",
      "lawId": "54d889bc1eaee3455707c882",
      "name": "Nou Barris",
      "neighborhoods": [{
          "name": "Can Peguera",
          "comments": 0,
          "id": "can-peguera",
          "lawId": "54d790eebbfffcc3520f1132"
      }, {
          "name": "Canyelles",
          "comments": 0,
          "id": "canyelles",
          "lawId": "54d790eebbfffcc3520f1133"
      }, {
          "name": "Ciutat Meridiana",
          "comments": 0,
          "id": "ciutat-meridiana",
          "lawId": "54d790eebbfffcc3520f1134"
      }, {
          "name": "La Guineueta",
          "comments": 0,
          "id": "guineueta",
          "lawId": "54d790eebbfffcc3520f1135"
      }, {
          "name": "Porta",
          "comments": 0,
          "id": "porta",
          "lawId": "54d790eebbfffcc3520f1136"
      }, {
          "name": "Prosperitat",
          "comments": 0,
          "id": "prosperitat",
          "lawId": "54d790eebbfffcc3520f1137"
      }, {
          "name": "Les Roquetes",
          "comments": 0,
          "id": "roquetes",
          "lawId": "54d790eebbfffcc3520f1138"
      }, {
          "name": "Torre Baró",
          "comments": 0,
          "id": "torre-baro",
          "lawId": "54d790eebbfffcc3520f1139"
      }, {
          "name": "La Trinitat Nova",
          "comments": 0,
          "id": "trinitat-nova",
          "lawId": "54d790eebbfffcc3520f113a"
      }, {
          "name": "El Turó de la Peira",
          "comments": 0,
          "id": "turo-peira",
          "lawId": "54d790eebbfffcc3520f113b"
      }, {
          "name": "Vallbona",
          "comments": 0,
          "id": "vallbona",
          "lawId": "54d790eebbfffcc3520f113c"
      }, {
          "name": "Verdum",
          "comments": 0,
          "id": "verdum",
          "lawId": "54d790eebbfffcc3520f113d"
      }, {
          "name": "Vilapicina i la Torre Llobeta",
          "comments": 0,
          "id": "vilapicina",
          "lawId": "54d790eebbfffcc3520f113e"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "sant-andreu",
      "lawId": "54d889bc1eaee3455707c87f",
      "name": "Sant Andreu",
      "neighborhoods": [{
          "name": "Baró de Viver",
          "comments": 0,
          "id": "baro-viver",
          "lawId": "54d791031d5965c55247f36f"
      }, {
          "name": "Bon Pastor",
          "comments": 0,
          "id": "bon-pastor",
          "lawId": "54d791031d5965c55247f370"
      }, {
          "name": "El Congrés i els Indians",
          "comments": 0,
          "id": "congres",
          "lawId": "54d791031d5965c55247f371"
      }, {
          "name": "Navas",
          "comments": 0,
          "id": "navas",
          "lawId": "54d791031d5965c55247f372"
      }, {
          "name": "Sant Andreu de Palomar",
          "comments": 0,
          "id": "sant-andreu-b",
          "lawId": "54d791031d5965c55247f373"
      }, {
          "name": "La Sagrera",
          "comments": 0,
          "id": "sagrera",
          "lawId": "54d791031d5965c55247f374"
      }, {
          "name": "Trinitat Vella",
          "comments": 0,
          "id": "trinitat-vella",
          "lawId": "54d791031d5965c55247f375"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "sant-marti",
      "lawId": "54d889bc1eaee3455707c886",
      "name": "Sant Martí",
      "neighborhoods": [{
          "name": "El Besòs i el Maresme",
          "comments": 0,
          "id": "besos-maresme",
          "lawId": "54d79111fe892ec752acece4"
      }, {
          "name": "El Clot",
          "comments": 0,
          "id": "clot",
          "lawId": "54d79111fe892ec752acece5"
      }, {
          "name": "El Camp de l'Arpa del Clot",
          "comments": 0,
          "id": "camp-arpa",
          "lawId": "54d79111fe892ec752acece6"
      }, {
          "name": "Diagonal Mar i el Front Marítim del Poblenou",
          "comments": 0,
          "id": "diagonal-mar",
          "lawId": "54d79111fe892ec752acece7"
      }, {
          "name": "El Parc i la Llacuna del Poblenou",
          "comments": 0,
          "id": "parc-llacuna",
          "lawId": "54d79111fe892ec752acece8"
      }, {
          "name": "El Poblenou",
          "comments": 0,
          "id": "poblenou",
          "lawId": "54d79111fe892ec752acece9"
      }, {
          "name": "Provençals del Poblenou",
          "comments": 0,
          "id": "provencals",
          "lawId": "54d79111fe892ec752acecea"
      }, {
          "name": "Sant Martí de Provençals",
          "comments": 0,
          "id": "sant-marti-provencals",
          "lawId": "54d79111fe892ec752aceceb"
      }, {
          "name": "La Verneda i la Pau",
          "comments": 0,
          "id": "verneda",
          "lawId": "54d79111fe892ec752acecec"
      }, {
          "name": "La Vila Olímpica del Poblenou",
          "comments": 0,
          "id": "vila-olimpica",
          "lawId": "54d79111fe892ec752aceced"
      }]
  }, {
      "comments": 0,
      "ownComments": 0,
      "id": "sants-montjuic",
      "lawId": "54d889bc1eaee3455707c885",
      "name": "Sants Montjuïc",
      "neighborhoods": [{
          "name": "La Bordeta",
          "comments": 0,
          "id": "bordeta",
          "lawId": "54d7913c2d4e0eca52018bab"
      }, {
          "name": "La Font de la Guatlla",
          "comments": 0,
          "id": "font-guatlla",
          "lawId": "54d7913c2d4e0eca52018bac"
      }, {
          "name": "Hostafrancs",
          "comments": 0,
          "id": "hostafrancs",
          "lawId": "54d7913c2d4e0eca52018bad"
      }, {
          "name": "La Marina de Port",
          "comments": 0,
          "id": "marina-port",
          "lawId": "54d7913c2d4e0eca52018bae"
      }, {
          "name": "La Marina del Prat Vermell",
          "comments": 0,
          "id": "marina-prat",
          "lawId": "54d7913c2d4e0eca52018baf"
      }, {
          "name": "El Poble-sec",
          "comments": 0,
          "id": "poble-sec",
          "lawId": "54d7913c2d4e0eca52018bb0"
      }, {
          "name": "Sants",
          "comments": 0,
          "id": "sants",
          "lawId": "54d7913c2d4e0eca52018bb1"
      }, {
          "name": "Sants-Badal",
          "comments": 0,
          "id": "sants-badal",
          "lawId": "54d7913c2d4e0eca52018bb2"
      }]
  },{
      "comments": 0,
      "ownComments": 0,
      "id": "sarria-sant-gervasi",
      "lawId": "54d889bc1eaee3455707c887",
      "name": "Sarrià - Sant Gervasi",
      "neighborhoods": [{
          "name": "El Putget i Farró",
          "comments": 0,
          "id": "putget",
          "lawId": "54d7911df9a54dc85208777c"
      }, {
          "name": "Sarrià",
          "comments": 0,
          "id": "sarria",
          "lawId": "54d7911df9a54dc85208777d"
      }, {
          "name": "Sant Gervasi - la Bonanova",
          "comments": 0,
          "id": "bonanova",
          "lawId": "54d7911df9a54dc85208777e"
      }, {
          "name": "Sant Gervasi - Galvany",
          "comments": 0,
          "id": "galvany",
          "lawId": "54d7911df9a54dc85208777f"
      }, {
          "name": "Les Tres Torres",
          "comments": 0,
          "id": "tres-torres",
          "lawId": "54d7911df9a54dc852087780"
      }, {
          "name": "Vallvidrera, el Tibidabo i les Planes",
          "comments": 0,
          "id": "vallvidrera",
          "lawId": "54d7911df9a54dc852087781"
      }]
  }];

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


  init();


});