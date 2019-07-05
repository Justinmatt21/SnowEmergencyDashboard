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
    });
  }
  
  function optionChanged(newSnowEmerg) {
    d3.json("../static/data/snowEmergenciesList.json").then((snowEmergs) => {
          snowEmergs["snowEmergencies"].forEach((snowEmerg) => {
            if (snowEmerg["name"] === newSnowEmerg) {
                plotSnowEmergency(snowEmerg);
            }
          });
    });
  }

function initBubble() {
  url = `/sqlBubble`;

  var bubbleSelector = d3.select("#bubble");

  d3.json(url).then((response) => {
    console.log(response);

    var years = response.year;
    var tickets = response.tickets;
    var tows = response.tows;
    var revenue = response.towing_revenue;
    var expenses = response["towing expenses"];
    var revenue_less_expenses = response["towing revenue less expenses"];
    
    colors = [];
    
    revenue_less_expenses.forEach(function(item) {

      if (item < 0) {
        colors.push("red");
      }

      else {
        colors.push("green");
      }
    });

    console.log(colors);

    var trace1 = {
      x: years,
      y: tows,
      text: revenue_less_expenses,
      hovertemplate:  '<b>Tows:</b> %{y}  <br>'+
                      '<b>Towing Revenue:</b> %{marker.size:,}  <br>'+
                      '<b>Towing Revenue minus Expenses:</b> %{text}' +
                      '<extra></extra>',
      mode: 'lines+markers',
      marker: {
        size: revenue,
        sizemode: 'area',
        sizeref: 2000,
        sizemin: 4,
        color: colors
      },
      name: "tows"
    };

    var trace2 = {
      x: years,
      y: tickets,
      text: revenue_less_expenses,
      hovertemplate:  '<b>Tickets:</b> %{y}  <br>'+
                      '<extra></extra>',
      mode: 'lines+markers',
      marker: {
        color: "black", 
        symbol: "star",
        size: 10
      },
      name: "tickets"
    };

    var data = [trace1, trace2];


    var layout = {
      title: {
        text: "Tows and Tickets per Snow Emergency over Time"
      },
      xaxis: {
        title: "Year",
        tickmode: "array",
        tickvals: years,
        ticktext: years
      },
      yaxis: {
        title: "Number of Tows or Tickets"
      }
    }

    Plotly.newPlot("bubble", data, layout);


  });
};

// Initialize the dashboard
init();
initBubble();

