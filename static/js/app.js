function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
  
    // Use the list of sample names to populate the select options
    d3.json("static/data/snowEmergenciesList.json").then((snowEmergs) => {
    console.log(snowEmergs);
      snowEmergs["snowEmergencies"].forEach((snowEmerg) => {
        selector
          .append("option")
          .text(snowEmerg["name"])
          .property("value", snowEmerg["name"]);
      });
  
      const firstSnowEmerg = snowEmergs["snowEmergencies"][0];
      plotSnowEmergency(firstSnowEmerg);
    });
  }
  
  function optionChanged(newSnowEmerg) {
    d3.json("static/data/snowEmergenciesList.json").then((snowEmergs) => {
          snowEmergs["snowEmergencies"].forEach((snowEmerg) => {
            if (snowEmerg["name"] === newSnowEmerg) {
                plotSnowEmergency(snowEmerg);
            }
          });
    });
  }
  
  // Initialize the dashboard
  init();