var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 150,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
    .select("#barchart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// The scale spacing the groups:
var x0 = d3.scaleBand()
.rangeRound([0, width])
.paddingInner(0.1);

// The scale for spacing each group's bar:
var x1 = d3.scaleBand()
.padding(0.05);

var y = d3.scaleLinear()
.rangeRound([height, 0]);

var z = d3.scaleOrdinal()
.range(["#98abc5", "#8a89a6"]);

d3.csv("../static/data/barChartData.csv", function(d, i, columns) {
for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
return d;
}).then(function(data) {
console.log(data);

var keys = data.columns.slice(1);

console.log('keys');
console.log(keys);
x0.domain(data.map(function(d) { return d.emergency; }));
x1.domain(keys).rangeRound([0, x0.bandwidth()]);
y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("class","bar")
    .attr("transform", function(d) { return "translate(" + x0(d.emergency) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
    .attr("x", function(d) { return x1(d.key); })
    .attr("y", function(d) { return y(d.value); })
    .attr("width", x1.bandwidth())
    .attr("height", function(d) { return height - y(d.value); })
    .attr("fill", function(d) { return z(d.key); });

g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0))
    .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-75)");


g.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text("Count");

var legend = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
    .attr("x", width - 17)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", z)
    .attr("stroke", z)
    .attr("stroke-width",2)
    .on("click",function(d) { update(d) });

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });

var filtered = [];

////
//// Update and transition on click:
////

function update(d) {

    //
    // Update the array to filter the chart by:
    //

    // add the clicked key if not included:
    if (filtered.indexOf(d) == -1) {
        filtered.push(d);
        // if all bars are un-checked, reset:
        if(filtered.length == keys.length) filtered = [];
    }
    // otherwise remove it:
    else {
        filtered.splice(filtered.indexOf(d), 1);
    }

    //
    // Update the scales for each group(/emergency)'s items:
    //
    var newKeys = [];
    keys.forEach(function(d) {
        if (filtered.indexOf(d) == -1 ) {
            newKeys.push(d);
        }
    })
    x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

    // update the y axis:
    svg.select(".y")
        .transition()
        .call(d3.axisLeft(y).ticks(null, "s"))
        .duration(500);


    //
    // Filter out the bands that need to be hidden:
    //
    var bars = svg.selectAll(".bar").selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })

    bars.filter(function(d) {
            return filtered.indexOf(d.key) > -1;
        })
        .transition()
        .attr("x", function(d) {
            return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width"))/2;
        })
        .attr("height",0)
        .attr("width",0)
        .attr("y", function(d) { return height; })
        .duration(500);

    //
    // Adjust the remaining bars:
    //
    bars.filter(function(d) {
            return filtered.indexOf(d.key) == -1;
        })
        .transition()
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("fill", function(d) { return z(d.key); })
        .duration(500);


    // update legend:
    legend.selectAll("rect")
        .transition()
        .attr("fill",function(d) {
            if (filtered.length) {
                if (filtered.indexOf(d) == -1) {
                    return z(d);
                }
                else {
                    return "white";
                }
            }
            else {
                return z(d);
            }
        })
        .duration(100);


}

});