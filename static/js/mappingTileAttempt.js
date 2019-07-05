var map = d3.select('#mapContainer');

// var width = 700;
// var height = 580;



var margin = {top: -5, right: -5, bottom: -5, left: -5};
// width = 700 - margin.left - margin.right,
// height = 580 - margin.top - margin.bottom;
var width = Math.max(960, window.innerWidth),
    height = Math.max(500, window.innerHeight);

// var randomX = d3.randomNormal(width / 2, 80),
//     randomY = d3.randomNormal(height / 2, 80),
//     data = d3.range(2000).map(function() { return [randomX(), randomY()]; });
// console.log(data);

var pi = Math.PI,
tau = 2 * pi;

var svg = map
  .append('svg')
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
  // .attr('width', width)
  // .attr('height',height);

var projection = d3.geoMercator()
  .scale(1 / tau)
  .translate([0, 0]);

// var projection = d3.geoMercator()
//   .scale(125000)
//   .rotate([93.2650, 0])
//   .center([0, 44.9778])
//   .translate([width/2, height/2]);

var geoPath = d3.geoPath()
    .projection(projection);

//Adding tiles

var tile = d3.tile()
    .size([width, height]);

// End Adding tiles

//Adding zoom

var zoom = d3.zoom()
  .scaleExtent([100 << 1100, 100 << 1400])
  .on('zoom', zoomed);

var center = projection([-93.2650, 44.9778]);

var raster = svg.append('g');
var g = svg.append('g');

// g.scale(100 << 1200);

svg
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(100 << 1200)
        .translate(-center[0], -center[1]));

function zoomed() {
    // k = d3.event.transform.k;
    var transform = d3.event.transform;
    g.attr("transform", transform);
    g.selectAll("circle")
        .attr("d", projection(projection))
        .attr("r",5/transform.k)
        .attr("stroke-width",1/transform.k);

    var tiles = tile
      .scale(transform.k)
      .translate([transform.x, transform.y ])
      ();

    projection
        .scale(transform.k / tau)
        .translate([transform.x, transform.y]);

    var image = raster
      .attr("transform", stringify(tiles.scale, tiles.translate))
      .selectAll("image")
      .data(tiles, function(d) { return d; });
  
    image.exit().remove();
  
    image.enter().append("image")
        .attr("xlink:href", function(d) { return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        .attr("x", function(d) { return d[0] * 256; })
        .attr("y", function(d) { return d[1] * 256; })
        .attr("width", 256)
        .attr("height", 256);

}

// //End adding zoom

// Adding tooptips

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// End adding tooltips

  cityBoundaryUrl = "https://opendata.arcgis.com/datasets/89f1a70c0cf24d7692e2d02fdf8f4e47_0.geojson";
  d3.json(cityBoundaryUrl).then(function(cityData) {
    // cityBoundary.selectAll('path')
    g.selectAll('path')
    .data(cityData.features)
    .enter()
    .append('path')
    .attr( "class", "city-boundary")
    .attr('fill', 'transparent')
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr('d', geoPath);
  });
  
  communitiesUrl = "https://opendata.arcgis.com/datasets/e0a3b6a4c23b4a03b988388553cb9638_0.geojson";
  d3.json(communitiesUrl).then(function(commData) {
    // communities.selectAll('path')
    g.selectAll('path')
    .data(commData.features)
    .enter()
    .append('path')
    .attr("class", "communities-boundary")
    .attr('fill', 'transparent')
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr('d', geoPath);
  });

  neighborhoodsUrl = "https://opendata.arcgis.com/datasets/055ca54e5fcc47329f081c9ef51d038e_0.geojson";
  d3.json(neighborhoodsUrl).then(function(hoodData) {
  // neighborhoods.selectAll('path')
  g.selectAll('path')
    .data(hoodData.features)
    .enter()
    .append('path')
    .attr("class", "neighborhoods-boundary")
    .attr('fill', 'transparent')
    .attr("stroke", "blue")
    .attr("stroke-width", 1)
    .attr('d', geoPath);
  });

var hoodCheckbox = document.querySelector('input[id="hood-toggle"]');
var commCheckbox = document.querySelector('input[id="comm-toggle"]');

var towsCheckbox = document.querySelector('input[id="tows-toggle"]');
var ticketsCheckbox = document.querySelector('input[id="tickets-toggle"]');

hoodCheckbox.onchange = function() {
  if(this.checked) {
    d3.selectAll(".neighborhoods-boundary").attr("visibility", "visible");
    d3.selectAll(".communities-boundary").attr('fill', 'transparent');
  } else {
    d3.selectAll(".neighborhoods-boundary").attr("visibility", "hidden");
    d3.selectAll(".communities-boundary").attr('fill', '#ccc');
  }
};

commCheckbox.onchange = function() {
  if(this.checked) {
    d3.selectAll(".communities-boundary").attr("visibility", "visible");
  } else {
    d3.selectAll(".communities-boundary").attr("visibility", "hidden");
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

  function plotSnowEmergency(snowEmergency) {
      g.selectAll('circle').remove();

      d3.json(snowEmergency["tagsgeojson"]).then(function(mapData) {
        g.selectAll('circle')
        .data(mapData.features)
        .enter()
        .append('circle')
        .attr("id", "snowDots")
        .attr( "class", "tickets")
        .attr("stroke", "white")
        .attr('fill', 'yellow')
        .style("opacity", 0.5)
        .attr('r', '5px')
        .attr("cx", function (d) {
          if (d.geometry === null) {
            
        } else {
          // console.log(projection(d.geometry.coordinates));
          return projection(d.geometry.coordinates)[0]; }
        })
        .attr("cy", function (d) { 
          if (d.geometry === null) {
            
        } else {
          return projection(d.geometry.coordinates)[1]; }
        })
      });

      d3.json(snowEmergency["towsgeojson"]).then(function(mapData) {        
        g.selectAll('circle')
          .data(mapData.features)
          .enter()
          .append('circle')
          .attr("id", "snowDots")
          .attr( "class", "tows")
          .attr("stroke", "white")
          .attr('fill', 'red')
          .style("opacity", 0.5)
          .attr('r', '5px')
          .attr("cx", function (d) {
            if (d.geometry === null) {
              
          } else {
            // console.log(projection(d.geometry.coordinates));
            return projection(d.geometry.coordinates)[0]; }
          })
          .attr("cy", function (d) { 
            if (d.geometry === null) {
              
          } else {
            return projection(d.geometry.coordinates)[1]; }
          })
      });

}

g
  .on("mouseover", function () {
    d3.selectAll('#snowDots')
    .on("mouseover", function(d) {
      if (d3.select(this).attr("class") === "tows") {
        dotType = "Tow";
      } else {
        dotType = "Ticket";
      }
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html(dotType + "<br/>" + d.properties.Day_ID + "<br/>" + d.properties.Address)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
      })
      
  })
  .on("mouseout", function () {
    d3.selectAll('#snowDots')
    .on("mouseout", function(d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
      });
  })
  .append('rect')
  .attr('class', 'click-capture')
  .style('visibility', 'hidden')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', width)
  .attr('height', height);


  function stringify(scale, translate) {
    var k = scale / 256, r = scale % 1 ? Number : Math.round;
    return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
  }