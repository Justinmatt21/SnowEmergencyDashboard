function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
  
    // Use the list of sample names to populate the select options
    d3.json("../static/data/snowEmergenciesList.json").then((snowEmergs) => {
    console.log(snowEmergs);
      snowEmergs["snowEmergencies"].forEach((snowEmerg) => {
        selector
          .append("option")
          .text(snowEmerg["name"])
          .property("value", snowEmerg["name"]);
      });
  
      const firstSnowEmerg = snowEmergs["snowEmergencies"][0];
      plotSnowEmergency(firstSnowEmerg);
      console.log(firstSnowEmerg["name"].slice(5));
      buildEpisode(firstSnowEmerg["name"].slice(5));
      // buildSnowMap(firstSnowEmerg["name"].slice(5));
    });
  }
  
  function optionChanged(newSnowEmerg) {
    d3.json("../static/data/snowEmergenciesList.json").then((snowEmergs) => {
          snowEmergs["snowEmergencies"].forEach((snowEmerg) => {
            if (snowEmerg["name"] === newSnowEmerg) {
                plotSnowEmergency(snowEmerg);
                buildEpisode(snowEmerg["name"].slice(5));
            }
          });
    });
  }

function initChart() {
  d3.json("/sql").then((response) => {
    console.log(response);
  });
};

// Initialize the dashboard
init();

function buildEpisode(snowEmergency) {

  buildSnowMap(snowEmergency);

  console.log("Build storm description:"); 

  let url = `/episode/${snowEmergency}`;

  d3.json(url).then(function(response){
    
    console.log(response);
    let responseArray = Object.entries(response);
    //console.log("Clearing old panel data");
    d3.select("#episode-text").html("");

    //console.log("Entering new panel data");
    d3.select("#episode-text").selectAll("div")
      .data(responseArray)
      .enter()
      .append("div")
      .html(function(d) {
        //console.log(d[1][0]);
        return `<hr><p>${d[1][0]}</p>`
      });

    buildSatellite(snowEmergency);
  });

}

function buildSatellite(snowEmergency) {
  console.log("Build satellite image");

  let url = `/episode_satellite/${snowEmergency}`;

  d3.json(url).then(function(response){
    
    console.log(response);
    let responseArray = Object.entries(response);

    //console.log("Clearing old panel data");
    d3.select("#episode-satellite").html("");

    //console.log("Entering new panel data");
    d3.select("#episode-satellite").selectAll("div")
      .data(responseArray)
      .enter()
      .append("div")
      .html(function(d) {
        console.log(d[1][0]);
        return `<hr><img class="image-responsive" src=${d[1][0]} width: 25%>`
      });
  });
}

// API_KEY = window.prompt("Enter your mapbox API Key", "");
const API_KEY = "pk.eyJ1IjoiZG91Z2RyYWtlIiwiYSI6ImNqeDEwbDV5MDA0dHE0Ym80aHF6M2Z3eTAifQ.0qGzAA9kqM1D2sKTlz4haQ";

function buildSnowMap(snowEmerg) {
    /* data route */
  var url = `/snowfall/${snowEmerg}`;

  d3.json(url).then(function(response) {

    console.log(response);
    var title = `${snowEmerg}`;

    console.log(response.longitude);

    var lon = response.longitude;
    var lat = response.latitude;
    var snow = response.snowfall;
    var name = response.name;

    scl = [[0, 'rgb(150,0,90)'],[0.125, 'rgb(0, 0, 200)'],[0.25,'rgb(0, 25, 255)'],[0.375,'rgb(0, 152, 255)'],[0.5,'rgb(44, 255, 150)'],[0.625,'rgb(151, 255, 0)'],[0.75,'rgb(255, 234, 0)'],[0.875,'rgb(255, 111, 0)'],[1,'rgb(255, 0, 0)']];

    var desired_maximum_marker_size = 80;
    var data = [{
        type: 'scattermapbox',
        mode: 'markers',
        text: name,
        lon: lon,
        lat: lat,
        marker: {
          color: snow,
          colorscale: scl,
          cmin: 0,
          cmax: 15,
          reversescale: true,
          size: snow,
            sizeref: 2.0 * Math.max(...snow) / (desired_maximum_marker_size**2),
            sizemode: 'area',
          colorbar:{
            thickness: 10,
            titleside: 'right',
            outlinecolor: 'rgba(68,68,68,0)',
            ticks: 'outside',
            ticklen: 3,
            shoticksuffix: 'last',
            ticksuffix: 'inches',
            dtick: 1
          }
        },
        name: title
    }];

    layout = {
        dragmode: 'zoom',
        mapbox: {
          center: {
              lat: 44.98,
              lon: -93.25
          },
          domain: {
            x: [0, 1],
            y: [0, 1]
          },
          style: 'light',
          zoom: 10
        },
        margin: {
          r: 0,
          t: 0,
          b: 0,
          l: 0,
          pad: 0
        },
        showlegend: false
     };
  
     Plotly.setPlotConfig({
        mapboxAccessToken: API_KEY
      })
    
    Plotly.newPlot("snowfallmap", data, layout);
  });
}
