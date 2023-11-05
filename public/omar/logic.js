import {createYearlyGenreData, processData} from "./dataProcessing.js";


const minYear = 1955;
const maxYear = 2015;
let subGenreChartActive = false;
// chart dimensions
const margin = { top: 60, right: 60, bottom: 50, left: 60 },
    width = 1200 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;
const checkboxContainer = d3.select("#genre-checkboxes");
const subCheckboxContainer = d3.select("#sub-genre-checkboxes");



d3.json('data.json').then(data => {
    const genreMappings = {
        "Rock": ["J-Rock", "Visual Kei", "Garage Rock", "Punk Rock"],
        "Hip Hop": ["Hip Hop", "Gangsta Rap", "Underground Hip Hop", "Alternative Hip Hop"],
        "Pop": ["Pop", "Pop Rock", "Synthpop", "Europop"],
        "Metal": ["Heavy Metal", "Death Metal", "Thrash Metal", "Black Metal"],
        "Electronic": ["Electronic", "Electro", "Trance", "Techno"],
        "Indie": ["Indie Pop", "Indie Rock", "Indie Folk"],
        "Dance": ["Dancehall", "Eurodance", "Dance", "Dubstep"],
        "R&B": ["R&B", "Soul", "Gospel", "Contemporary R&B"],
        "Jazz": ["Jazz", "Jazz Fusion", "Free Jazz"],
        "Folk": ["Folk", "Folk Rock", "Americana", "Celtic"]
    };
    const genreData = processData(data);

    const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // keys and color scale
    const keys = Object.keys(genreData[0]).filter(key => key !== 'year');
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet2);
    // Stacked data
    const stackedData = d3.stack()
        .keys(keys)
        (genreData);
    // x-axis
    const x = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, width]);
    const tickValues = Array.from({ length: Math.ceil((maxYear - minYear) / 5) + 1 }, (_, i) => minYear + i * 5);
    const xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.format("d")));
    // x-axis-title
    svg.append("text")
        .attr("class", "x-axis-title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Years");
    // y-axis-title
    svg.append("text")
        .attr("class", "y-axis-title")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10) // Adjust the Y position as needed
        .attr("transform", "rotate(-90)")
        .text("Number of Songs Produced");



    //the y-axis scale
    const y = d3.scaleLinear();
    function removeYAxis() {
        svg.select("g.y-axis").remove();
    }
    function createYAxis(y, tickValues) {
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).ticks(5).tickValues(tickValues));
    }
    // Create the initial y-axis
    y.domain([0, 600])
        .range([height, 0]);
    createYAxis(y, [0, 100, 200, 300, 400,500,600]);

    const clipPathId = "clip-path";
    svg.append("defs").append("clipPath")
        .attr("id", clipPathId)
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    const areaChart = svg.append('g')
        .attr("clip-path", `url(#${clipPathId})`);

    const area = d3.area()
        .x(d => x(d.data.year))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));
    areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", d => "main-genre-area " + d.key + " cursor-pointer")
        .style("fill", d => color(d.key))
        .style("display", "block")
        .attr("d", area);

    // Create checkboxes for each main genre
    keys.forEach((genre, index) => {
        checkboxContainer
            .append("label")
            .html(`<input type="checkbox" class="genre-checkbox" value="${genre}" checked> ${genre}`);
    });

    d3.selectAll(".genre-checkbox").on("change", function () {
        updateChart();
    });
    // details toolip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    tooltip.append("div")
        .attr("class", "tooltip-name");
    tooltip.append("div")
        .attr("class", "tooltip-count");

    //date
    const dateSlider = document.getElementById("slider");
    const dateMin = document.getElementById("date-min");
    const dateMax = document.getElementById("date-max");
    noUiSlider.create(dateSlider, {
        start: [minYear, maxYear],
        connect: true,
        step: 1,
        range: {
            'min': minYear,
            'max': maxYear
        }
    });
    // Update the x-axis scale based on the new date range
    dateSlider.noUiSlider.on('update', function (values) {
        if(!subGenreChartActive) {
            const [min, max] = values.map(parseFloat);
            dateMin.textContent = min;
            dateMax.textContent = max;
            updateChart(min, max);

            // Update the x-axis scale based on the new date range
            x.domain([min, max]);
            xAxis.transition().duration(100).call(d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.format("d")));
        }
        else {
            const [min, max] = values.map(parseFloat);
            dateMin.textContent = min;
            dateMax.textContent = max;
            updateChartSubGenre(min, max);

            // Update the x-axis scale based on the new date range
            x.domain([min, max]);
            xAxis.transition().duration(100).call(d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.format("d")));
        }

    });
    // back button to go back to the main chart area
    const backButton = d3.select("body")
        .append("button")
        .text("Back ")
        .style("display", "none");

    backButton.on("click", function () {
        backButton.style("display", "none"); // Hide the button after going back to the main genre
        subGenreChartActive = false;
        keys.forEach((genre, index) => {
            checkboxContainer
                .append("label")
                .html(`<input type="checkbox" class="genre-checkbox" value="${genre}" checked> ${genre}`);
        });
        areaChart.selectAll(".subgenre-area").remove();
        updateChart();
        resetMainChart();// Show the main chart
        d3.selectAll(".genre-checkbox").on("change", function () {
            updateChart();
        });

    });


    hoverEventMainGenre();
    hoverEventSubGenre();



    function resetMainChart() {
        areaChart.selectAll(".main-genre-area")
            .on("click", function (event, d) {
                if (!subGenreChartActive) { // Check if the subgenre chart is not already active

                    const mainGenre = d.key;
                    subGenres = genreMappings[mainGenre];

                    if (subGenres) {

                        backButton.style("display", "inline-block");
                        // Show the "Back to Main Chart" button
                        subGenres.forEach((subgenre, index) => {
                            const checkboxLabel = subCheckboxContainer
                                .append("label")
                                .html(`<input type="checkbox" class="subgenre-checkbox" value="${subgenre}" checked> ${subgenre}`);

                            // Log the label's HTML to check if the element is created correctly.

                        });

                        updateChartSubGenre(subGenres);

                        subGenreChartActive = true; // Set the flag to indicate the subgenre chart is active
                        d3.selectAll(".subgenre-checkbox").on("change", function () {
                            updateChartSubGenre(subGenres);

                        });
                    }
                }
            });

        // Reset tooltip interaction for the main chart
        hoverEventMainGenre();


    }



    function updateChart(minYearFilter = minYear, maxYearFilter = maxYear) {
        subCheckboxContainer.selectAll("label").remove();
        areaChart.selectAll(".main-genre-area").remove();
        const selectedGenres = [];
        d3.selectAll(".genre-checkbox").each(function () {
            if (this.checked) {
                selectedGenres.push(this.value);
            }
        });

        // Filter the data based on the selected years
        const filteredData = genreData.filter(d => d.year >= minYearFilter && d.year <= maxYearFilter);

        // Initialize an empty data structure for the updated data
        const updatedData = [];
        filteredData.forEach(d => {
            const newData = { year: d.year };
            selectedGenres.forEach(genre => {
                newData[genre] = d[genre]; // Copy the values for selected genres
            });
            updatedData.push(newData);
        });
        // Recalculate stacked data for the updated data
        const updatedStackedData = d3.stack()
            .keys(selectedGenres)
            (updatedData);

        // Redefine the y domain based on the updated stacked data
        y.domain([0, 600])
            .range([height, 0]);

        removeYAxis();
        createYAxis(y, [0, 100, 200,300,400,500,600]);

        // Update the areas
        areaChart
            .selectAll(".mylayers")
            .data(updatedStackedData)
            .enter()
            .append("path")
            .attr("class", d => "main-genre-area " + d.key + " cursor-pointer")
            .style("fill", d => color(d.key))
            .style("display", "block")
            .attr("d", area);

        handleClickOnMainGenre();
        hoverEventMainGenre();
        updateLegend(selectedGenres,color);
    }

    //handling when clicking in the main genre
    let subGenres = [];
    function handleClickOnMainGenre(){
        areaChart.selectAll(".main-genre-area")
            .on("click", function (event, d) {
                if (!subGenreChartActive) { // Check if the subgenre chart is not already active

                    const mainGenre = d.key;
                    subGenres = genreMappings[mainGenre];


                    if (subGenres) {
                        backButton.style("display", "inline-block")
                            .attr("class", "back-button");
                        // Show the "Back to Main Chart" button
                        subGenres.forEach((subgenre, index) => {
                            const checkboxLabel = subCheckboxContainer
                                .append("label")
                                .html(`<input type="checkbox" class="subgenre-checkbox" value="${subgenre}" checked> ${subgenre}`);

                            // Log the label's HTML to check if the element is created correctly.

                        });

                        updateChartSubGenre(subGenres);

                        subGenreChartActive = true; // Set the flag to indicate the subgenre chart is active
                        d3.selectAll(".subgenre-checkbox").on("change", function () {
                            updateChartSubGenre(subGenres);

                        });
                    }
                }
            });
    }
    handleClickOnMainGenre();


    const subGenreColor = d3.scaleOrdinal()
        .domain(subGenres) // Use subgenres as the domain
        .range(d3.schemeCategory10);
    function updateChartSubGenre(selectedGenres , minYearFilter = minYear, maxYearFilter = maxYear) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);

        checkboxContainer.selectAll("label").remove();

        const selectedSubGenres1 = [];
        d3.selectAll(".subgenre-checkbox").each(function () {
            if (this.checked) {
                selectedSubGenres1.push(this.value);
            }
        });

        const data1 = createYearlyGenreData(data);
        data1.filter(d => d.year >= minYearFilter && d.year <= maxYearFilter);
        console.log("years",data1)
        function fillUndefinedWithZero(d, subGenre) {
            return d[subGenre] !== undefined ? d[subGenre] : 0;
        }
        const filteredSubGenreData = data1.map(d => {
            const newData = { year: d.year };

            selectedSubGenres1.forEach(subGenre => {
                newData[subGenre] = fillUndefinedWithZero(d, subGenre);
            });

            return newData;
        });

        // Recalculate stacked data for the updated data
        const updatedStackedData = d3.stack()
            .keys(selectedSubGenres1)
            (filteredSubGenreData);
        areaChart.selectAll(".main-genre-area").remove();
        areaChart.selectAll(".subgenre-area").remove();
        // Redefine the y domain based on the updated stacked data
        y.domain([0, 200])
            .range([height, 0]);

        removeYAxis();
        createYAxis(y, [0,100, 200]);

        // Update the areas
        areaChart
            .selectAll(".mylayers")
            .data(updatedStackedData)
            .enter()
            .append("path")
            .attr("class", d => "subgenre-area " + d.key + " cursor-pointer")
            .style("fill", d => subGenreColor(d.key))
            .style("display", "block")
            .attr("d", area);
        hoverEventSubGenre();
        updateLegend(selectedSubGenres1,subGenreColor);
    }
    function hoverEventSubGenre(){
        areaChart.selectAll(".subgenre-area")
            .on("mouseover", function (event, d) {
                console.log("sub")
                handleHoverSubGenre(event,d);

            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }



    function hoverEventMainGenre(){
        areaChart.selectAll(".main-genre-area")
            .on("mouseover", function (event, d) {
                console.log("main")

                handleHoverMainGenre(event,d);





            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }



    function getSubGenreData(data, subGenre) {
        return data[subGenre];
    }
    function handleHoverMainGenre(event, d){
        const genre = d.key;
        const totalSongs = d3.sum(d.map((layer) => layer[1] - layer[0])); // Calculate the total number of songs

        const tooltipName = tooltip.select(".tooltip-name");
        const tooltipCount = tooltip.select(".tooltip-count");

        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);

        // Update tooltip content and position
        tooltipName.html(genre);
        tooltipCount.html(`Total Songs: ${totalSongs}`);
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");

    }


    function handleHoverSubGenre(event, d) {
        const subGenre = d.key;
        const subGenreData = getSubGenreData(data, subGenre);

        if (subGenreData) {
            const totalSongs = d3.sum(d.map((layer) => layer[1] - layer[0]));
            const topThreeSongs = subGenreData.topThreeRankedSongs.slice(0, 3);

            const tooltipName = tooltip.select(".tooltip-name");
            const tooltipCount = tooltip.select(".tooltip-count");

            // Show the tooltip with a smoother transition
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

            // Create a structured HTML content for the tooltip
            const tooltipContent = `
      <div class="tooltip-title">${subGenre}</div>
      <div class="tooltip-total-songs">Total Songs: ${totalSongs}</div>
      <div class="tooltip-top-songs">Top Three Songs:</div>
      <ul>
        ${topThreeSongs.map((song) => `<li>${song.title}</li>`).join('')}
      </ul>
    `;

            tooltipName.html('');
            tooltipCount.html(tooltipContent);

            // Position the tooltip near the cursor
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }
    }



    function updateLegend(selectedGenres, colorScale) {
        const legend = d3.select(".legend");
        legend.selectAll(".legend-item").remove(); // Remove the existing legend items

        const updatedLegend = legend
            .selectAll("div")
            .data(selectedGenres)
            .enter()
            .append("div")
            .attr("class", "legend-item")
            .style("display", "inline-block")
            .style("margin-right", "10px");

        updatedLegend.append("div")
            .attr("class", "legend-key")
            .attr("id", d => `legend-${d}`) // Assign unique IDs to the legend items
            .style("background", d => colorScale(d)) // Use the provided color scale
            .style("width", "10px")
            .style("height", "10px")
            .style("display", "inline-block");

        updatedLegend.append("div")
            .attr("class", "legend-value")
            .text(d => d);
    }

});
