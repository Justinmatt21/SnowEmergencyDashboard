

// read the relevant csv files to get the plot layers
d3.csv("static/data/mn_weather_stations.csv", function(err, stationData) {
  d3.csv("static/data/final_snowfall_and_tows.csv", function(err2, towingData) {

  console.log("In CSV reader");
  // if (err) throw err;
  console.log("Passed error check");

  createFeatures(mplsNeighborhoods, stationData, towingData, "");
  })
});

function createEmergencyLayer(towingData, emergency) {

  let tows = L.markerClusterGroup();

  towingData.forEach(function(data) {

    if (data.emergency === emergency) {
      tows.addLayer(L.marker([data.latitude, data.longitude]).bindPopup(`${data.Snowfall}`));
    }
  });
  return tows;
}

function createFeatures(neighborhoodData, stationData, towingData, emergencies) {

  // Create a GeoJSON layer containing the features array on neighborhood object
  var neighborhoods = L.geoJSON(neighborhoodData, {
    // Called on each feature
    onEachFeature: function(feature, layer) {
      // Set mouse events to change map styling
      layer.on({
        // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
        mouseout: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
        // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
        // click: function(event) {
        //  feature.fitBounds(event.target.getBounds());
        // }
      });
      // Giving each feature a pop-up with information pertinent to it
      layer.bindPopup("<h1>" + feature.properties.BDNAME + "</h1> <hr> <h2>" + feature.properties.FID + "</h2>");
    }
  });

  // Create a new layer group for weather stations
  var stations = L.layerGroup();
  
  // parse data
  stationData.forEach(function(data) {
    data.lat = Number(data.lat);
    data.lon = Number(data.lon);
  });

  stationData.forEach(function(data) {
    stations.addLayer(L.marker([data.lat, data.lon])
    .bindPopup(data.Name));

  });

  towingData.forEach(function(data) {
    data.latitude = Number(data.latitude);
    data.longitude = Number(data.longitude);
    data.Snowfall = Number(data.Snowfall);
  });

  let towsList = [];

  let emergencyList = ['Armatage', 'Dana', 'Diamond Lake', 'Ferry', 'Howe', 'Jane', 'Olive', 'Pembina', 'Quincy', 'Upton', 'Westminster', 'Xerxes', 'Yale', 'Yardville', 'Grant', 'Polk'];

  emergencyList.forEach(function(emergency) {
    towsList.push(createEmergencyLayer(towingData, emergency));
  })
  
 
  // Sending our earthquakes layer to the createMap function
  createMap(neighborhoods, stations, towsList, emergencyList);
}

function createMap(neighborhoods, stations, towsList, emergencyList) {

  // Define streetmap and darkmap layers
  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satelliteMap,
    "Gray Scale": grayscaleMap,
    "Outdoors": outdoorsMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    'Neighborhoods': neighborhoods,
    'Weather Stations': stations,
  };

  towsList.forEach((tow, i) => overlayMaps[emergencyList[i]] = tow);

  let layersList = [satelliteMap, neighborhoods, stations].concat(towsList);

  // Create our map, giving it the satellite and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [44.97, -93.26],
    zoom: 12,
    layers: layersList
  });

  /* var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    var magnitudes = [0, 1, 2, 3, 4, 5];
    var labels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];

    // loop through our magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(magnitudes[i]) + '"></i> ' + labels[i] + '<br>';
    }
    return div;
  };  // end legend.onAdd

  legend.addTo(myMap);
 
  // The following
  // https://gis.stackexchange.com/questions/68941/how-to-add-remove-legend-with-leaflet-layers-control
  // Add an event listener that adds/removes the legends if the earthquakes layer is added/removed.

  myMap.on('overlayremove', function(eventLayer) {
    if (eventLayer.name === 'Earthquakes') {
      this.removeControl(legend);
    }
  });

  myMap.on('overlayadd', function (eventLayer) {
    // Turn on the legend...
    if (eventLayer.name === 'Earthquakes') {
        legend.addTo(this);
    } 
  });
  */ 

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

/* -- */
