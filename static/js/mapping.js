
    var map = d3.select('#mapContainer');
    //Part of zooming functionality
    // var width = map.node().getBoundingClientRect().width;
    // var height = width / 1.5;
    var width = 700;
    var height = 580;
    
    var svg = map
      .append('svg')
      .attr('width', width)
      .attr('height',height);
    
    var neighborhoods = svg.append('g');
    var communities = svg.append('g');
    
    var albersProjection = d3.geoAlbers()
      .scale(190000)
      .rotate([93.2650, 0])
      .center([0, 44.9778])
      .translate([width/2, height/2]);

    //Part of zooming functionality
    //   svg 
    //     .call(d3.zoom()
    //       .scaleExtent([0.2, 10])
    //       .translateExtent([[0,0], [width, height]])
    //       .extent([[0, 0], [width, height]])
    //       .on("zoom", function () {
    //         svg.attr("transform", d3.event.transform)
    //       })
    //   )
    
    var geoPath = d3.geoPath()
        .projection(albersProjection);
    
    neighborhoods.selectAll('path')
      .data(mplsNeighborhoods.features)
      .enter()
      .append('path')
      .attr( "class", "neighborhoods")
      .attr('fill', '#ccc')
      .attr("stroke", "blue")
      .attr("stroke-width", 1)
      .attr('d', geoPath);

    communities.selectAll('path')
      .data(mplsCommunities.features)
      .enter()
      .append('path')
      .attr( "class", "communities")
      .attr('fill', 'transparent')
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr('d', geoPath);
    
    //Functions for this commented section are built into the check box selections, but preserved until certainty of not being needed
    // grantTows2015Url = "https://opendata.arcgis.com/datasets/2726be2ce37141de9969105666700b9b_0.geojson"; 
    // grantTows2015Url = "static/data/Snow_Emergency_Grant_Tows_2015.geojson";

    // d3.json(grantTows2015Url).then(function(mapData) {
    //   grantTows2015.selectAll('path')
    //     .data(mapData.features)
    //     .enter()
    //     .append('path')
    //     .attr( "class", "tows")
    //     .attr("stroke", "white")
    //     .attr('fill', 'red')
    //     .attr('d', geoPath);
    // });
    
    // grantTows2015.selectAll('circle')
    //   .data(tows2015Grant.features)
    //   .enter()
    //   .append('circle')
    //   .attr( "class", "tows")
    //   .attr('fill', 'red')
    //   .attr("cx",function(d) { 
    //     if (d["geometry"] === undefined) {
    //       // console.log(true);
    //     } else {
    //       // console.log(albersProjection([d["geometry"]["x"],d["geometry"]["y"]])[0]);
    //       return albersProjection([d["geometry"]["x"],d["geometry"]["y"]])[0];
    //     }
    //   })
    //   .attr("cy",function(d) {       
    //     if (d["geometry"] === undefined) {
    //       // console.log(true);
    //     } else {
    //       // console.log(albersProjection([d["geometry"]["x"],d["geometry"]["y"]])[1]);
    //       return albersProjection([d["geometry"]["x"],d["geometry"]["y"]])[1];
    //     }
    //   })
    //   .attr("r","2px");

    var hoodCheckbox = document.querySelector('input[id="hood-toggle"]');
    var commCheckbox = document.querySelector('input[id="comm-toggle"]');

    var towsCheckbox = document.querySelector('input[id="tows-toggle"]');
    var ticketsCheckbox = document.querySelector('input[id="tickets-toggle"]');

    // var grantCheckbox = document.querySelector('input[id="grant-toggle"]');
    // var howeCheckbox = document.querySelector('input[id="howe-toggle"]');

    hoodCheckbox.onchange = function() {
      if(this.checked) {
        d3.selectAll(".neighborhoods").attr("visibility", "visible");
        d3.selectAll(".communities").attr('fill', 'transparent');
      } else {
        d3.selectAll(".neighborhoods").attr("visibility", "hidden");
        d3.selectAll(".communities").attr('fill', '#ccc');
      }
    };

    commCheckbox.onchange = function() {
      if(this.checked) {
        d3.selectAll(".communities").attr("visibility", "visible");
      } else {
        d3.selectAll(".communities").attr("visibility", "hidden");
      }
    };

    towsCheckbox.onchange = function() {
        if(this.checked) {
          d3.selectAll(".tows").attr("visibility", "visible");
        } else {
          d3.selectAll(".tows").attr("visibility", "hidden");
        }
      };

    ticketsCheckbox.onchange = function() {
        if(this.checked) {
          d3.selectAll(".tickets").attr("visibility", "visible");
        } else {
          d3.selectAll(".tickets").attr("visibility", "hidden");
        }
      };
    
    // grantCheckbox.onchange = function() {
    //   if(this.checked) {
    //     var grantTows2015 = svg.append('g')
    //       .attr( "id", "grantTows2015");
    //     grantTows2015Url = "https://opendata.arcgis.com/datasets/2726be2ce37141de9969105666700b9b_0.geojson";
    //     d3.json(grantTows2015Url).then(function(mapData) {
    //     grantTows2015.selectAll('path')
    //       .data(mapData.features)
    //       .enter()
    //       .append('path')
    //       .attr( "class", "tows")
    //       .attr("stroke", "white")
    //       .attr('fill', 'red')
    //       .attr('d', geoPath);
    // });
    //   } else {
    //     d3.select("#grantTows2015").remove();
    //   }
    // };

    // howeCheckbox.onchange = function() {
    //   if(this.checked) {
    //     var howeTows2018 = svg.append('g')
    //       .attr( "id", "howeTows2018");
    //       howeTows2018Url = "https://opendata.arcgis.com/datasets/0bf74f21025c49b386e64376043053b2_0.geojson";
    //     d3.json(howeTows2018Url).then(function(mapData) {
    //       howeTows2018.selectAll('path')
    //       .data(mapData.features)
    //       .enter()
    //       .append('path')
    //       .attr( "class", "tows")
    //       .attr("stroke", "white")
    //       .attr('fill', 'yellow')
    //       .attr('d', geoPath);
    // });
    //   } else {
    //     d3.select("#howeTows2018").remove();
    //   }
    // };

function plotSnowEmergency(snowEmergency) {
    d3.select("#snowDots").remove();

    var snowDots = svg.append('g')
        .attr("id", "snowDots");
    d3.json(snowEmergency["towsgeojson"]).then(function(mapData) {
        snowDots.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr( "class", "tows")
        .attr("stroke", "white")
        .attr('fill', 'red')
        .attr('d', geoPath);
    });
    d3.json(snowEmergency["tagsgeojson"]).then(function(mapData) {
        snowDots.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr( "class", "tickets")
        .attr("stroke", "white")
        .attr('fill', 'yellow')
        .attr('d', geoPath);
    });
}