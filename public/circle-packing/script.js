var gradientBar = document.getElementById("gradient-bar");
var barHeight = gradientBar.offsetHeight;
var indicators = document.getElementsByClassName("indicator");
var numberOfIndicators = indicators.length;
var counter = 0;
for (var x = 0; x < numberOfIndicators; x++) {
    indicators[x].style.top = counter + "px";
    counter += barHeight / numberOfIndicators + 3;
}

$(gradientBar).parent().hide();

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
        var data = await d3.json("grouped_circular_data.json");

        var packLayout = d3.pack()
            .size([width, height]).padding( function(d) {
            if (d.depth == 1 && d.children.length==1) {
                return 10;
            }
            else
                return 0;
        });

        var rootNode = d3.hierarchy(data)

        rootNode.sum(sizeCircle);

        packLayout(rootNode);



        var keysContinentFilters = rootNode.data.children.map(item => item.name);

        const { minFans, maxFans } = findMinMaxDeezerFans(data);
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([minFans, maxFans]);

        const { minYear, maxYear } = findMinMaxPublicationYears(data);
        console.log(minYear);
        var lastMaxYear = maxYear;
        var lastMinYear = minYear;
        $( function() {
            $( "#slider-range" ).slider({
                range: true,
                min: minYear,
                max: maxYear,
                values: [ minYear, maxYear ],
                slide: function( event, ui ) {
                    $( "#sliderTxt" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
                    lastMaxYear =  ui.values[ 1 ];
                    lastMinYear = ui.values[ 0 ];
                    updateYears(ui.values[ 0 ], ui.values[ 1 ])
                }
            });
            $( "#sliderTxt" ).val( $( "#slider-range" ).slider( "values", 0 ) +
                " - " + $( "#slider-range" ).slider( "values", 1 ) );
        } );


        function sizeCircle(d) {
            if (d.PublicationDates) {
                var map;
                switch (document.getElementById("circleSizeInfo").value){
                    case "NbArtistesAlive":
                        map = d.PublicationDates.map(d => d.NbArtistesAlive ?? 0);
                        break;
                    default:
                        map = d.PublicationDates.map(d => d.NbArtiste ?? 0);
                        break;
                }
                return map.reduce((accumulator, current) => {
                    return accumulator + current;
                }, 0);
            }
            else
                return 0
        };

        function sizeCircleArtistesAlive(d) {
            if (d.PublicationDates) {
                return d.PublicationDates.map(d => d.NbArtistesAlive ?? 0).reduce((accumulator, current) => {
                    return accumulator + current;
                }, 0);
            }
            else
                return 0
        };
        function sizeCircleArtistes(d) {
            if (d.PublicationDates) {
                return d.PublicationDates.map(d => d.NbArtiste ?? 0).reduce((accumulator, current) => {
                    return accumulator + current;
                }, 0);
            }
            else
                return 0
        }

        function nbDeezerFans(d) {
            if (d.PublicationDates) {
                return d.PublicationDates.map(d => d.NbDezerFan ?? 0).reduce((accumulator, current) => {
                    return accumulator + current;
                }, 0);
            }
            else
                return 0
        };

        // Color palette for continents?
        var color = d3.scaleOrdinal()
            .domain(keysContinentFilters)
            .range(d3.schemeSet2);

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
                    .html('<u>Genre</u>'+ ': '+d.data.name+'<br><b>Nb Artistes: '+sizeCircleArtistes(d.data)+'</b><br>' +
                        '<b>Nb Artistes Alive: '+sizeCircleArtistesAlive(d.data)+'</b><br' +
                        '><b>Nb Fans: '+nbDeezerFans(d.data)+'</b>' )
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

        function ColorFans(d){
            if (!document.getElementById("heatMapDeezerFans").checked){
                $(".wrapperHeatMap .scale").hide();
                return "rgba(0,0,0,0.5)";
            }
            else
                $(".wrapperHeatMap .scale").show();

            var res = nbDeezerFans(d);
            return colorScale(res);
        }

        function displayDatas(datas) {

             svg.append('g')
                 .attr("id","wrapperDatas")
                .selectAll('g')
                .data(datas)
                .join('g')
                .style("fill", function (d) {
                    if (d.data.type == "continent")
                        return color(d.data.name)
                    else if (d.data.type == "genre") {
                        return ColorFans(d.data);
                    }
                    else
                        return "transparent";
                })
                .attr("class", d => d.data.type)
                .attr("data-name", d => d.data.name)
                .attr("data-parent", d => d.parent ? d.parent.data.name : "")
                .style("fill-opacity", 1)
                .attr("stroke", "black")
                .style("stroke-width", function (d) {
                    return d.data.type == undefined ? "0" : "1";
                })
                .attr('transform', function (d) {
                    return 'translate(' + [d.x, d.y] + ')'
                })
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                .append('circle')
                .attr('r', function (d) {
                    return d.r;
                })
        }

        displayDatas(rootNode.descendants())


        var size = 20

        var filters = d3.select("#GroupedCircularVisualisation")
            .append("div")
            .attr("class", "filterContinent")
            .attr("width", 200)
            .attr("height", 200)

        filters.selectAll("mydots")
            .data(keysContinentFilters)
            .enter()
            .append('label')
            .text(function(d) { return d; })
            .style("color", function(d){ return color(d)})
            .style("font-weight", "bold")
            .style("--background-color-filter", function(d){ return color(d)})
            .attr("class", "continent-filter")
            .append("input")
            .attr("type", "checkbox")
            .attr("checked", true)
            .attr("value", d=>d)
            .attr("x", 100)
            .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)

        function updateYears(min, max){
            setTimeout(function () {
                var filteredData = filterByPublicationYearRange(data,min,max);
                rootNode = d3.hierarchy(filteredData)

                rootNode.sum(sizeCircle);

                packLayout(rootNode);
                d3.select("#wrapperDatas").remove();
                displayDatas(rootNode.descendants());
            },0)
        }

        function updateContinent(withDelay=true){

            //var timeOut = withDelay ? 400 : 0;
//
            //d3.selectAll(".continent-filter input").each(function(d){
            //    cb = d3.select(this);
            //    grp = cb.property("value")
//
            //    // If the box is check, I show the group
            //    if(cb.property("checked")){
            //        svg.selectAll(".continent[data-name='"+grp+"'] *").transition().duration(timeOut).style("opacity", 1)
            //        svg.selectAll(".genre[data-parent='"+grp+"'] *").transition().duration(timeOut).style("opacity", 1)
//
            //    }else{
            //        svg.selectAll(".continent[data-name='"+grp+"'] *").transition().duration(timeOut).style("opacity", 0)
            //        svg.selectAll(".genre[data-parent='"+grp+"'] *").transition().duration(timeOut).style("opacity", 0)
            //    }
            //})
            setTimeout(function (){
                var continentToHide = d3.selectAll(".continent-filter input:not(:checked)").data()
                    .map(function(d) { return d; })

                var filteredData = {
                    ...data,
                    children: data.children.filter(child => !(child.type === "continent" && continentToHide.includes(child.name)))
                };
                rootNode = d3.hierarchy(filteredData)

                rootNode.sum(sizeCircle);

                packLayout(rootNode);
                d3.select("#wrapperDatas").remove();
                displayDatas(rootNode.descendants())
            },0)
        }

        d3.selectAll(".continent-filter input, #circleSizeInfo, #heatMapDeezerFans").on("change",function (){
            updateContinent(false);
            updateYears(lastMinYear,lastMaxYear)
        });

        updateContinent(false);
        updateYears(minYear,maxYear);


    } catch(error) {
        console.log(error);
    }
})();

function findMinMaxPublicationYears(data) {
    let minYear = Infinity; // Initialize to positive infinity
    let maxYear = -Infinity; // Initialize to negative infinity

    function traverse(node) {
        if (node.PublicationDates) {
            for (const publication of node.PublicationDates) {
                if (publication.yearOfPublication < minYear) {
                    minYear = publication.yearOfPublication;
                }
                if (publication.yearOfPublication > maxYear) {
                    maxYear = publication.yearOfPublication;
                }
            }
        }

        if (node.children) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }

    traverse(data);
    return { minYear, maxYear };
}

function findMinMaxDeezerFans(data) {
    let minFans = Infinity; // Initialize to positive infinity
    let maxFans = -Infinity; // Initialize to negative infinity

    function traverseFans(node) {
        if (node.PublicationDates) {
            for (const publication of node.PublicationDates) {
                if (publication.NbDezerFan < minFans) {
                    minFans = publication.NbDezerFan;
                }
                if (publication.NbDezerFan > maxFans) {
                    maxFans = publication.NbDezerFan;
                }
            }
        }

        if (node.children) {
            for (const child of node.children) {
                traverseFans(child);
            }
        }
    }

    traverseFans(data);
    return { minFans: minFans, maxFans: maxFans };
}

function filterByPublicationYearRange(data, minYear, maxYear) {
    var continentToHide = d3.selectAll(".continent-filter input:not(:checked)").data()
        .map(function(d) { return d; })
    // Create a deep copy of the data object
    const filteredData = {
        ...data,
        children: data.children.filter(continent => !continentToHide.includes(continent.name)).map(continent => {
            const filteredChildren = filterArrayByPublicationYearRange(continent.children, minYear, maxYear);

            return {
                ...continent,
                children: filteredChildren.length > 0 ? filteredChildren : undefined
            };
        }).filter(continent => continent.children !== undefined)
    };

    return filteredData;
}
function filterArrayByPublicationYearRange(arr, min, max) {
    return arr.filter((item) => {
        if (item.PublicationDates) {
            for (const publication of item.PublicationDates) {
                const year = publication.yearOfPublication;
                if (year >= min && year <= max) {
                    return true;
                }
            }
        }
        return false;
    });
}
