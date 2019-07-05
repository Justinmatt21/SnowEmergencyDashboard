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