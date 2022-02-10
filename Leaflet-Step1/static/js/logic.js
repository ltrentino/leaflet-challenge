// URL from USGS GeoJSON Feed page for All Earthquakes from past 7 days.
    // https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

var earthquakesURL_week = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var earthquakesURL_month = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson"
// Plates data from JSON file downloaded from https://github.com/fraxen/tectonicplates/tree/master/GeoJSON
var tectonicplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// create LayerGroups
var earthquakes_week = L.layerGroup();
var tectonicplates = L.layerGroup();
var earthquakes_month = L.layerGroup();
// Title layers
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

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Satellite Map": satmap,
  "Dark Map": darkmap
};


// Create overlay object to hold our overlay layer
var overlayMaps = {
  "Earthquakes: past week": earthquakes_week,
  "Earthquakes: past month": earthquakes_month,
  "Tectonic Plates" : tectonicplates
};


// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [
    3, 27
  ],
  zoom: 3,
  layers: [darkmap, earthquakes_week]
});


// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

// Perform a GET request to the earthquakesURL
d3.json(earthquakesURL_week, function(data) {
  console.log(data)
  //Determin marker size by magnitude
  function markerSize(magnitude) {
    return 1.5 * magnitude;
  };
  
  // Set Colors for earthquakes magnitude
  function getColor(m) {
    var colors = ['lightgreen','yellowgreen','gold','orange','lightsalmon','tomato'];
    return  m > 8? colors[5]:
            m > 7? colors[4]:
            m > 6.1? colors[3]:
            m > 5.5? colors[2]:
            m > 2.5? colors[1]:
                    colors[0];
    };
  
  // GeoJSON layer
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 1,
        color: "white",
        stroke: true,
        weight: 0.3
      });
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h3 style="font-weight: bold;">${feature.properties.place}</h3> <hr>
      <p>${new Date(feature.properties.time)}</p>
      <p>Magnitude: ${feature.properties.mag}</p>
      <a href="${feature.properties.url}" target="_blank">More info</a>`);
    }
  }).addTo(earthquakes_week);

  earthquakes_week.addTo(myMap);

//////////////////////////////////////////////////

  d3.json(earthquakesURL_month, function(data) {
    console.log(data)
    //Determin marker size by magnitude
    function markerSize(magnitude) {
      return 1.5 * magnitude;
    };
    
    // Set Colors for earthquakes magnitude
    function getColor(m) {
      var colors = ['lightgreen','yellowgreen','gold','orange','lightsalmon','tomato'];
      return  m > 8? colors[5]:
              m > 7? colors[4]:
              m > 6.1? colors[3]:
              m > 5.5? colors[2]:
              m > 2.5? colors[1]:
                     colors[0];
      };
    
    // GeoJSON layer
    L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
          radius: markerSize(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: 1,
          color: "white",
          stroke: true,
          weight: 0.3
        });
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`<h3 style="font-weight: bold;">${feature.properties.place}</h3> <hr>
        <p>${new Date(feature.properties.time)}</p>
        <p>Magnitude: ${feature.properties.mag}</p>
        <a href="${feature.properties.url}" target="_blank">More info</a>`);
      }
    }).addTo(earthquakes_month);
  
    earthquakes_month.addTo(myMap);


  });








  // Get tectonic plate data 
  d3.json(tectonicplatesURL, function (data) {
    L.geoJSON(data, {
      color: "lightblue",
      weight: 1
    }).addTo(tectonicplates);
    tectonicplates.addTo(myMap);
  });

    
  // The legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
      var div = L.DomUtil.create("div", "legend");
      div.innerHTML += "<h4>Magnitude</h4>";
      div.innerHTML += '<i style="background: tomato"></i><span>8.0 or greater </span><br>';
      div.innerHTML += '<i style="background: lightsalmon"></i><span>7 to 7.9</span><br>';
      div.innerHTML += '<i style="background: orange"></i><span>6.1 to 6.9</span><br>';
      div.innerHTML += '<i style="background: gold"></i><span>5.5 to 6.0</span><br>';
      div.innerHTML += '<i style="background: yellowgreen"></i><span>2.5 to 5.4</span><br>';
      div.innerHTML += '<i style="background: lightgreen"></i><span>2.5 or less</span><br>';
      return div;
  };
  legend.addTo(myMap);


  // Info bottomleft
  var info = L.control({ position: "bottomleft" });
  info.onAdd = function (map) {
      var div = L.DomUtil.create("div", "info");
      div.innerHTML += "<h4>Earthquake Magnitude Scale</h4>";
      div.innerHTML += '<i style="background: tomato"></i><span>> 8  _____Great earthquake. Can totally destroy communities near the epicenter.</span><br>';
      div.innerHTML += '<i style="background: lightsalmon"></i><span>7 to 7.9 __Major earthquake. Serious damage.</span><br>';
      div.innerHTML += '<i style="background: orange"></i><span>6.1 to 6.9 _May cause a lot of damage in very populated areas.</span><br>';
      div.innerHTML += '<i style="background: gold"></i><span>5.5 to 6.0 _Slight damage to buildings and other structures.</span><br>';
      div.innerHTML += '<i style="background: yellowgreen"></i><span>2.5 to 5.4 _Often felt, but only causes minor damage.</span><br>';
      div.innerHTML += '<i style="background: lightgreen"></i><span>< 2.5 ____Usually not felt, but can be recorded by seismograph.	</span><br>';
      return div;
  };
  info.addTo(myMap);



});
