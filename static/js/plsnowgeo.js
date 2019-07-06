API_KEY = window.prompt("Enter your mapbox API Key", "");

function buildSnowMap(snowEmerg) {
    /* data route */
  var url = `/snowgeojson/${snowEmerg}`;

  d3.json(url).then(function(response) {

    console.log(response);
    var title = `${snowEmerg}`;

    var lon = response.features.map(function(feature) {return feature.geometry.coordinates.longitude});
    console.log(lon);
    var lat = response.features.map(function(feature) {return feature.geometry.coordinates.latitude});
    var snow = response.features.map(function(feature) {return feature.properties.snowfall});
    var name = response.features.map(function(feature) {return feature.properties.name});

    scl = [[0, 'rgb(150,0,90)'],[0.125, 'rgb(0, 0, 200)'],[0.25,'rgb(0, 25, 255)'],[0.375,'rgb(0, 152, 255)'],[0.5,'rgb(44, 255, 150)'],[0.625,'rgb(151, 255, 0)'],[0.75,'rgb(255, 234, 0)'],[0.875,'rgb(255, 111, 0)'],[1,'rgb(255, 0, 0)']];

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
          cmax: 1.4,
          reversescale: true,
          opacity: 0.5,
          size: 3,
          colorbar:{
            thickness: 10,
            titleside: 'right',
            outlinecolor: 'rgba(68,68,68,0)',
            ticks: 'outside',
            ticklen: 3,
            shoticksuffix: 'last',
            ticksuffix: 'inches',
            dtick: 0.1
          }
        },
        name: title
    }];

    layout = {
        dragmode: 'zoom',
        mapbox: {
          center: {
              lat: 44.884,
              lon: -93.222
          },
          domain: {
            x: [0, 1],
            y: [0, 1]
          },
          style: 'light',
          zoom: 3
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