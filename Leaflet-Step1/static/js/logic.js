
// URL from USGS GeoJSON Feed page for All Earthquakes from past 7 days.
    // https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

// Store our API endpoint inside queryUrl

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Plates data from JSON file downloaded from https://github.com/fraxen/tectonicplates/tree/master/GeoJSON



// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data)
});

// Set Colors for earthquakes magnitude

function getColor(m) {

  var colors = ['lightgreen','yellowgreen','gold','orange','lightsalmon','tomato'];

  return  m > 5? colors[5]:
          m > 4? colors[4]:
          m > 3? colors[3]:
          m > 2? colors[2]:
          m > 1? colors[1]:
                 colors[0];
};

// function getColor(mag) {
//   if (mag >= 5) {
//     return "rgb(240, 107, 107)"
//   } else {
//     if (mag > 4) {
//       return "rgb(240, 167, 107)"
//     } else { 
//       if (mag > 3) {
//         return "rgb(243, 186, 77)"
//       } else {
//         if (mag > 2) {
//           return "rgb(243, 219, 77)"
//         } else {
//           if (mag > 1) {
//             return "rgb(226, 243, 77)"
//           } else {
//             return "rgb(183, 243, 77)"
//         }}}}}};

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3 style="font-weight: bold;">${feature.properties.place}</h3> <hr>
    <p>${new Date(feature.properties.time)}</p>
    <p>Magnitude: ${feature.properties.mag}</p>
    <a href="${feature.properties.url}" target="_blank">More info</a>`);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Create circle markers for each data point to reflect magnitude in size and colour.
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
        radius: feature.properties.mag*2,
        fillOpacity: 1,
        color: getColor(feature.properties.mag)
      })
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define satellite map and darkmap layers
  var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });


  // getting tectonic plates data - can't make it appear on the html file :(
  var tectonicPlates = new L.LayerGroup();
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json", function (data) {
    console.log(data),
    L.geoJSON(data, {
        color: 'red',
        weight: 2,
      })
      .addTo(tectonicPlates);
      tectonicPlates.addTo(myMap)
  });  





  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates" : tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      3, 27
    ],
    zoom: 3,
    layers: [satmap, earthquakes, tectonicPlates]
  });


  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);




  // The legend

  var legend = L.control({
    position: 'bottomright'
  });

      /* Adding on the legend based off the color scheme we have */
      legend.onAdd = function (color) {
          var div = L.DomUtil.create('div', 'info legend');
          var levels = ['5+', '4 to 5', '3 to 4', '2 to 3', '1 to 2', '0 to 1'];
          var colors = ["rgb(240, 107, 107)", "rgb(240, 167, 107)", "rgb(243, 186, 77)", "rgb(243, 219, 77)", "rgb(226, 243, 77)", "rgb(183, 243, 77)"]
          for (var i = 0; i < levels.length; i++) {
              div.innerHTML += '<h3 style="background:' + colors[i] + '">' + levels[i];
          }
          return div;
      };
      legend.addTo(myMap);


};
