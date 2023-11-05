
(async function() {
    try {

        // set the dimensions and margins of the graph
        var width = 500
        var height = 500

// append the svg object to the body of the page
        var svg = d3.select("#GroupedCircularVisualisation")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

// create dummy data -> just one element per circle
        var data = {
            "name": "World",
            "children": [
                {
                    "name": "Europe",
                    "type": "continent",
                    "children": [
                        {
                            "name": "Rock",
                            "type": "genre",
                            "NbArtiste": 100,
                            "NbDezerFan": 10000
                        },
                        {
                            "name": "Rap",
                            "type": "genre",
                            "NbArtiste": 30,
                            "NbDezerFan": 200
                        },
                        {
                            "name": "Funk",
                            "type": "genre",
                            "NbArtiste": 200,
                            "NbDezerFan": 1000
                        }
                    ]
                },
                {
                    "name": "Asia",
                    "type": "continent",
                    "children": [
                        {
                            "name": "Hip Hop",
                            "type": "genre",
                            "NbArtiste": 10,
                            "NbDezerFan": 20000
                        }
                    ]
                },
                {
                    "name": "Africa",
                    "type": "continent",
                    "children": [
                        {
                            "name": "Rai",
                            "type": "genre",
                            "NbArtiste": 98,
                            "NbDezerFan": 10
                        }
                    ]
                }
            ]
        };


        var packLayout = d3.pack()
            .size([width, height]);

        var rootNode = d3.hierarchy(data)
        console.log(rootNode);

        rootNode.sum(function(d) {
            return d.NbDezerFan;
        });

        packLayout(rootNode);

        // Color palette for continents?
        var color = d3.scaleOrdinal()
            .domain(["Asia", "Europe", "Africa", "Oceania", "Americas"])
            .range(d3.schemeSet1);

        var Tooltip = d3.select("#GroupedCircularVisualisation")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute")
        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            if (d.data.type=="genre") {
                Tooltip
                    .style("opacity", 1)
            }
        }
        var mousemove = function(d) {
            if (d.data.type=="genre") {
                Tooltip
                    .html('<u>' + d.data.name + '</u>')
                    .style("left", (event.pageX+10) + "px")
                    .style("top", (event.pageY)+10 + "px")
            }
        }
        var mouseleave = function(d) {
            if (d.data.type=="genre") {
                Tooltip
                    .style("opacity", 0)
            }
        }


        var nodes = svg.append('g')
            .selectAll('g')
            .data(rootNode.descendants())
            .join('g')
            .style("fill", function(d){
                if (d.data.type=="continent")
                    return color(d.data.name)
                else if (d.data.type=="genre")
                    return "rgba(0,0,0,0.5";
                else
                    return "transparent";
            })
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", function(d){return d.data.type== undefined ? "0" : "1" ;})
            .attr('transform', function(d) {return 'translate(' + [d.x, d.y] + ')'})
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        nodes
            .append('circle')
            .attr('r', function(d) { return d.r; })


        var keys = rootNode.data.children.map(item => item.name);

// Usually you have a color scale in your chart already
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeSet1);

// Add one dot in the legend for each name.
        var size = 20
        svg.selectAll("mydots")
            .data(keys)
            .enter()
            .append("rect")
            .attr("x", 100)
            .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
        svg.selectAll("mylabels")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", 100 + size*1.2)
            .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")




    } catch(error) {
        console.log(error);
    }
})();