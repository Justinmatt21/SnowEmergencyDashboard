// Douglas Drake - Cohort 3 - Homework 17

var API_KEY = "YOUR API KEY HERE";

API_KEY = window.prompt("Enter your mapbox API Key", "");

// var mplsCommunities = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var communitiesUrl = "https://opendata.arcgis.com/datasets/e0a3b6a4c23b4a03b988388553cb9638_0.geojson";
// RedYellowGreen color scale generated on ColorBrewer
// http://colorbrewer2.org/#type=diverging&scheme=RdYlGn&n=
// ['#d73027','#fc8d59','#fee08b','#d9ef8b','#91cf60','#1a9850']
function getColor(d) {
  
  let color = '';
  if (d < 1) {
    color = '#1a9850';
  } else if (d < 2) {
    color = '#91cf60';
  } else if (d < 3) {
    color = '#d9ef8b';
  } else if (d < 4) {
    color = '#fee08b';
  } else if (d < 5) {
    color = '#fc8d59';
  } else { 
    color = '#d73027';
  }
  return color
}

function getRadius(d) {
  // remember the radius in L.circle is in the unit of meters
  return 15000*d;
  // The radius in L.circleMarker is in pixels - 
  // return 3*d;
}

function buildSnowMap(snowEmerg) {
    console.log("Build new chart");
  
    let snowurl = `/snowgeojson/${snowEmerg}`;
    let towurl = `/towing/${snowEmerg}`;

    d3.json(towurl).then(function(towingData){

        d3.json(snowurl).then(function(snowfallData) {

            d3.json(communitiesUrl).then(function(communityData) {
                console.log(communityData);
                createFeatures(snowfallData.features, communityData.features, towingData);
            })
    
            console.log(snowfallData);
        });
        console.log(towingData);
        
        // console.log(getColorScheme(response.otu_ids.slice(0,10), colorDict));
        
    });
}

function createSnowfallLayer(snowfallData) {
    // Create a GeoJSON layer containing the features array on the snowfall
  // Run the pointToLayer function once for each piece of data in the array
  var snowfall = L.geoJSON(snowfallData, {
    pointToLayer: function(feature, latlng) {

      // magnitude determines the color
      var color = getColor(feature.properties.snowtotal);
      
      // Add circles to map
      return L.circle(latlng, {
        weight: 1,
        opacity: 0.75,
        fillOpacity: 0.75,
        color: color,
        fillColor: color,
        // Adjust radius
        radius: getRadius(feature.properties.snowtotal)
      }).bindPopup("<h4> Stormtotal: " + feature.properties.snowtotal + "<br>Location:  " + feature.properties.name + "</h4>");
    } // end pointToLayer
    });

    return snowfall;
}

function createTowingLayer(towingData) {

    var tows = L.markerClusterGroup();
  
    for (var i = 0; i < towingData.length; i++) {

          tows.addLayer(L.marker([towingData.latitude[i], towingData.longitude[i]]));
    }
    console.log(tows);
    return tows;
}

function createFeatures(snowfallData, communityData, towingData) {
    
    var communities = L.geoJSON(communityData, {
        style: function(feature) {
        return {color: "blue", weight: 1};
    }
  });

  var snowfall = createSnowfallLayer(snowfallData);

  var tows = createTowingLayer(towingData);

  // Sending our layers to createMap
  createMap(snowfall, communities, tows); 
}

function updateMap(snowEmerg) {

    // remove old layers
    this.removeLayer(snowfall);
    this.removeLayer(tows);

    console.log("Update chart");
  
    let snowurl = `/snowgeojson/${snowEmerg}`;
    let towurl = `/towing/${snowEmerg}`;

    d3.json(towurl).then(function(towingData){

        d3.json(snowurl).then(function(snowfallData) {

            d3.json(communitiesUrl).then(function(communityData) {
                console.log(communityData);
                createFeatures(snowfallData.features, communityData.features, towingData);
            })
    
            console.log(snowfallData);
        });
        console.log(towingData);
        
        // console.log(getColorScheme(response.otu_ids.slice(0,10), colorDict));
        
    });

    var communities = L.geoJSON(communityData, {
        style: function(feature) {
        return {color: "blue", weight: 1};
    }
  });

  var snowfall = createSnowfallLayer(snowfallData);

  var tows = createTowingLayer(towingData);

    // create new layers

    // push layers to the map

    //
}
function createMap(snowfall, communities, tows) {

    // document.getElementById('snowfallmap').innerHTML = "<div id='snowfallmap' style='width: 100%; height: 100%;'></div>";

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
    'Snowfall': snowfall,
    'Communities': communities,
    'Tows': tows
  };

  // Create our map, giving it the satellite and snowfall layers to display on load
  var myMap = L.map("snowfallmap", {
    center: [
      44.99, -93.26
    ],
    zoom: 14,
    layers: [satelliteMap, snowfall, communities]
  });

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    var snowfalls = [0, 1, 2, 3, 4, 5];
    var labels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];

    // loop through our magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < snowfalls.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(snowfalls[i]) + '"></i> ' + labels[i] + '<br>';
    }
    return div;
  };  // end legend.onAdd

  legend.addTo(myMap);
 
  // The following
  // https://gis.stackexchange.com/questions/68941/how-to-add-remove-legend-with-leaflet-layers-control
  // Add an event listener that adds/removes the legends if the earthquakes layer is added/removed.

  myMap.on('overlayremove', function(eventLayer) {
    if (eventLayer.name === 'Snowfall') {
      this.removeControl(legend);
    }
  });

  myMap.on('overlayadd', function (eventLayer) {
    // Turn on the legend...
    if (eventLayer.name === 'Snowfall') {
        legend.addTo(this);
    } 
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}