var scenes = ["scene-home", "scene-line-chart", "scene-map", "scene-bar-chart", "scene-conclusion", "scene-thank-you"];

var sceneIndex = 0;

var sliderYear = 1970;

var schoolLevel = "All";

var quarter = "overall"

var quarterColors = ["maroon", "#F8B8D0", "#00B4C5", "#C44601", "skyblue"]

var us, schoolShootingData, stateMapping, allQuarters;

async function init() {
    us = await d3.json("https://d3js.org/us-10m.v1.json");
    schoolShootingData = await d3.csv("./school_shootings_1970-2022.csv");
    schoolShootingData.forEach(function (d) {
        d.Date = d3.timeParse("%Y-%m-%d")(d.Date);
    });
    stateMapping = await d3.csv("./states.csv");
    allQuarters = [...new Set(schoolShootingData.map(d => d.Quarter))].filter(s => s !== "" && s !== "null");
    allQuarters.unshift("overall");
    getCurrentScene();
}

function moveToNextScene() {
    d3.select("#left-arrow").attr("disabled", null);
    if (sceneIndex < scenes.length - 1) {
        sceneIndex++;
        getCurrentScene(sceneIndex - 1);
    }
    else {
        sceneIndex = 0;
        getCurrentScene(scenes.length - 1);
    }
    d3.select("#" + scenes[sceneIndex])
    .style("transform", "translateX(1600px)")
    .transition().duration(1000)
    .style("transform", "translateX(0px)");
}

function moveToPreviousScene() {
    if (sceneIndex > 0) {
        sceneIndex--;
        getCurrentScene(sceneIndex + 1);
        d3.select("#" + scenes[sceneIndex])
        .style("transform", "translateX(-1600px)")
        .transition().duration(1000)
        .style("transform", "translateX(0px)");
        if (sceneIndex === 0) {
            d3.select("#left-arrow").attr("disabled", true);
        }
    }
}

function getCurrentScene(prevIndex) {
    d3.select("#" + scenes[prevIndex]).html("")
    switch (sceneIndex) {
        case 0:
            // Title Scene
            d3.select("#right-arrow").html("&rarr;");
            d3.select("#left-arrow").attr("disabled", true);
            d3.select(".mainContent").attr("id", scenes[sceneIndex]).append("h1")
            .text("School Shootings Data Visualization");
            d3.select("#" + scenes[sceneIndex]).append("p")
            .html(`From 1970 to 2002, there were about <b>2,069</b> school shootings with <b>684</b> 
            killed and <b>1,937</b> wounded. To see more details, click on the arrows below.`);
            break;
        case 1:
            // Time Trend Scene
            d3.select(".mainContent")
            .attr("id", scenes[sceneIndex])
            .append("h2").text("School Shootings Time Trend from 1970-2022")
            d3.select("#" + scenes[sceneIndex]).append("br")
            d3.select("#" + scenes[sceneIndex])
            .append("p")
            .text(`School shootings are one of the most unpredictable acts of gun violence, especially in the United States. These kinds of incidents sparked controversy on policies related to gun control and gun violence. The number of school shootings fluctuated between 10 and 63 from 1970 to 2010. The shootings rapidly increased to 118 in 2018, which was the year of the Parkland High School Shooting in Florida.
                There has been some stability during the COVID pandemic in 2020. However, since then, it has been rapidly increasing with the highest being 251 in the year 2021.`);
            d3.select("#" + scenes[sceneIndex]).append("p")
            .attr("class", "allQuarters")
            .text(`Here is the line chart that
                shows the time trend of school shootings for `)    
            d3.select(".allQuarters").append("select")
            .attr("id", "allQuarters").attr("name", "allQuarters")
            .selectAll("option").data(allQuarters)
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text(function(d) { return d; });
            d3.select("#" + scenes[sceneIndex]).append("svg")
            .attr("width", 800).attr("height", 400);
            createLineChart();
            d3.select("#" + scenes[sceneIndex]).append("p").text("Click on the right arrow to see the school shootings per state.");
            break;
        case 2:
            // US Choropleth Scene
            d3.select(".mainContent")
            .attr("id", scenes[sceneIndex])
            .append("h2").text("US Map of School Shootings from 1970-2022")
            d3.select("#" + scenes[sceneIndex]).append("br")
            d3.select("#" + scenes[sceneIndex])
            .append("p")
            .text(`From coast to coast, we are recuperating from recent school shootings, leaving catastrophic impacts on all Americans.
                From the map below, California, Texas, Florida and Illinois are 
                some of states that consistently have the greatest number of school shootings 
                possibly due to high crime rates. 
                Toggle the slider below to see how the number of school shootings 
                for each state changed over the years.`);
            createMapChart();
            d3.select("#" + scenes[sceneIndex]).append("p").text("Click on the right arrow to see the school shootings per location per school level.");
            break;
        case 3:
            // School Level and Location Bar Chart Scene
            var schoolLevels = [...new Set(schoolShootingData.map(d => d.School_Level))].filter(s => s !== "" && s !== "null" && s !== "Unknown");
            schoolLevels.unshift("All");
            d3.select(".mainContent")
            .attr("id", scenes[sceneIndex])
            .append("h2").text("School Shootings By School Level and Location")
            d3.select("#" + scenes[sceneIndex]).append("br")
            d3.select("#" + scenes[sceneIndex])
            .append("p").text("This bar chart displays the number of school shootings per location, grouped by the school level. As it turns out, for most of the school levels, the shootings occurred outside of the school property. Junior High and Other school levels had shootings from within the building.");
            d3.select("#" + scenes[sceneIndex])
            .append("p").attr("class", "dropdown-schoollevel").text("Here is the bar chart for the school shootings in ")
            d3.select(".dropdown-schoollevel").append("select")
            .attr("id", "schoolLevels").attr("name", "schoolLevels")
            .selectAll("option").data(schoolLevels)
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text(function(d) { return d; });
            var schoolLevelHTML = d3.select(".dropdown-schoollevel").html()
            d3.select(".dropdown-schoollevel").html(schoolLevelHTML + " school levels." );
            d3.select("#" + scenes[sceneIndex])
            .append("svg")
            .attr("width", 800).attr("height", 400);
            createBarChart();
            d3.select("#" + scenes[sceneIndex]).append("p").text("Click on the right arrow.");
            break;
        case 4:
            // Conclusion Scene
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
            .append("strong").text("We need to ask ourselves, how many more school shootings do we need before we start talking about this as a social problem, and not merely a random collection of isolated incidents? It has been proven that school shootings can happen anywhere without warning, and can happen to students of all ages, ethnicity, and religions, as well as teachers and administrators.")
            d3.select("#" + scenes[sceneIndex])
            .append("svg")
            .attr("width", 800).attr("height", 400);
            createSummaryLineChart();
            break;
        case 5:
            // Ending Scene
            d3.select("#right-arrow").html("&olarr;");
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
            .append("h1").text("Thank you for exploring this narrative visualization!");
            d3.select("#" + scenes[sceneIndex]).append("p").text("Hope you enjoyed it. Stay safe.")
            break;
        default:
            break;
    }
}

function createMapChart() {
    // Sets up conversion from TopoJSON to GeoJSON of US map, color scheme, and projection
    var states = topojson.feature(us, us.objects.states);
    var borders = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
    var dataMap = d3.rollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear(), (d) => d.State);
    var colorScheme = d3.scaleLinear().domain([0, d3.greatest(dataMap.get(sliderYear), d => d[1])[1]]).range(["white", "maroon"]);
    var projection = d3.geoIdentity().fitSize([750,350], states)
    var path = d3.geoPath().projection(projection);

    // Sets up mapping of State abbreviation to ANSI state code
    var abbrevs = d3.sort(stateMapping, (d) => d.State).map(d => d.Abbreviation);
    var ansiDict = states.features.map(d => parseInt(d.id))
        .sort(function(a, b) { return a - b;})
        .map(function (d, i) { return [d, abbrevs[i]]; });

    // Sets up legend axis
    var xLeg = d3.scaleLinear().domain([0, d3.greatest(dataMap.get(sliderYear), d => d[1])[1]]).range([10,400]);

    // Create a tooltip element for each state when hovered over
    var tooltip = d3.select("#" + scenes[sceneIndex])
        .append("div")
        .style("opacity", 0)
        .attr("class", "map-tooltip")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px");

    // Create a slider to change the year of the shooting incidents
    d3.select("#" + scenes[sceneIndex])
    .append("label").attr("for", "map-year-slider")
    .text(`US Choropleth Map of School Shootings in ${sliderYear} `);

    d3.select("#" + scenes[sceneIndex])
    .append("input")
    .attr("type", "range")
    .attr("id", "map-year-slider")
    .attr("name", "map-year-slider")
    .attr("min", 1970)
    .attr("max", 2022)
    .attr("step", 1)
    .attr("value", sliderYear)
    .on("input", function (e) {
        sliderYear = parseInt(e.target.value);
        colorScheme = d3.scaleLinear().domain([0, d3.greatest(dataMap.get(sliderYear), d => d[1])[1]]).range(["white", "maroon"]);
        d3.selectAll("path.states")
        .transition().duration(100)
        .attr("fill", function(d) {
            var stateANSI = ansiDict.filter(s => s[0] === parseInt(d.id))[0];
            return colorScheme(dataMap.get(sliderYear).get(stateANSI[1]) || 0); 
        });
        d3.select("label")
        .text("US Choropleth Map of School Shootings in " + sliderYear);
        xLeg.domain([0, d3.greatest(dataMap.get(sliderYear), d => d[1])[1]]).range([10,400]);
        d3.select(".choropleth-legend-axis").call(d3.axisBottom(xLeg).tickValues(colorScheme.domain()));
        d3.select(".choropleth-legend-title").text("Color Coding for " + sliderYear + " Choropleth");
    });

    // Create the US choropleth of the school shootings by the year that the slider landed on
    d3.select("#" + scenes[sceneIndex])
    .append("svg")
    .attr("width", 800).attr("height", 400);
    
    d3.select("svg").selectAll("path")
    .data(states.features)
    .enter().append("path")
    .attr("class", "states")
    .attr("fill", function(d) {
        var stateANSI = ansiDict.filter(s => s[0] === parseInt(d.id))[0];
        return colorScheme(dataMap.get(sliderYear).get(stateANSI[1]) || 0); 
    })
    .attr("d", path)
    .on("mouseover", function(event, d) {
        tooltip.style("opacity", 1);
    })
    .on("mousemove", function(event, d) {
        var stateANSI = ansiDict.filter(s => s[0] === parseInt(d.id))[0];
        tooltip
        .html(stateANSI[1] + " had " + (dataMap.get(sliderYear).get(stateANSI[1]) || 0) + " school shootings.")
        .style("top", `${event.y - 50}px`)
        .style("left", `${event.x / 2 - 60}px`);
    }).on("mouseleave", function(event, d) {
        tooltip.style("opacity", 0);
    });
    
    d3.select("svg").append("path")
    .datum(borders)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "darkgray")
    .attr("stroke-width", 1.5);

    var svgLegend = d3.select("#" + scenes[sceneIndex]).append("svg").attr("width", 410).attr("height", 80);
    var defs = svgLegend.append("defs");
    var linearGradient = defs.append("linearGradient").attr("id", "choropleth-legend");

    //horizontal gradient
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    
    linearGradient.selectAll("stop")
        .data([
            {offset: "0%", color: "white"},
            {offset: "100%", color: "maroon"}
        ])
        .enter().append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color);

    svgLegend.append("text")
        .attr("class", "choropleth-legend-title")
        .attr("x", 200)
        .attr("y", 20)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("Color Coding for " + sliderYear + " Choropleth")
    
    svgLegend.append("rect")
        .attr("x", 10)
        .attr("y", 30)
        .attr("width", 410)
        .attr("height", 15)
        .style("fill", "url(#choropleth-legend)");

    svgLegend
        .append("g")
        .attr("class", "choropleth-legend-axis")
        .attr("transform", "translate(2,45)")
        .call(d3.axisBottom(xLeg).tickValues(colorScheme.domain()));
}

function createLineChart() {
    // Aggregate the school shooting data based on year (and possibly quarter) and set up x and y scales
    var lineData = d3.flatRollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear());
    if (quarter !== "overall")
        lineData = d3.flatRollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear(), (d) => d.Quarter).filter((d) => d[1] === quarter);
    var dateExtent = d3.extent(lineData, function(d) { return d[0]; });
    var xScale = d3.scaleLinear().domain(dateExtent).range([0, 700]);
    var yScale = d3.scaleLinear().domain([0, d3.max(lineData, function(d) { return quarter === "overall" ? d[1] : d[2]; })]).range([300, 0]);

    // Create an annotation for the number of shootings in 2021
    var annotationData = lineData.filter(function(d) { return d[0] === 2021 })[0];

    var lineAnnotations = [{
        note: {
            label: "Due to the end of the COVID-19 pandemic, the schools resumed in-person learning which lead to a dramatic increase in school shootings.",
            title: "2021: Biggest School Shooting Peak",
            align: "middle",
            wrap: 200,
            padding: 15
        },
        x: xScale(annotationData[0]),
        y: yScale(quarter !== "overall" ? annotationData[2] : annotationData[1]),
        type: d3.annotationLabel,
        color: ["white"],
        dy: 0,
        dx: -162,
        connector: {
            end: "dot",
            type: "line",
            endScale: 5
        }
    }];
    
    // Create axes and axis labels
    d3.select("svg")
    .append("text")
    .attr("x", 400)
    .attr("y", 400)
    .attr("dy", -15)
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .text("Year")

    d3.select("svg")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 200)
    .attr("dx", -200)
    .attr("dy", -185)
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .text("# of School Shootings")

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,50)")
    .attr("class", "line-yAxis")
    .call(d3.axisLeft(yScale));

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,350)")
    .attr("class", "line-xAxis")
    .call(d3.axisBottom(xScale).tickFormat(function (d) { return d.toString().replace(",", ""); }));

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,50)")
    .datum(lineData)
    .append("path")
    .attr("class", "line-chart")
    .attr("fill", "none")
    .attr("stroke", quarterColors[allQuarters.indexOf(quarter)])
    .attr("stroke-width", 4)
    .attr("d", d3.line()
        .x(function(d) { return xScale(d[0]); })
        .y(function(d) { return yScale(quarter !== "overall" ? d[2] : d[1]); })
    );

    // Create a legend for the line chart
    var lineLegend = d3.select("svg").append("g").attr("transform", "translate(50,50)")
        .selectAll(".time-trend-legend").data(allQuarters).enter()
        .append("g").attr("class", "time-trend-legend")
        .attr("transform", function(d, i) { return `translate(100,${30*i})`});
    
    lineLegend.append("rect")
        .attr("fill", function(d, i) { return quarterColors[i]; })
        .attr("width", 10).attr("height", 10)
    
    lineLegend.append("text").text(function(d) { return d; })
        .attr("fill", "white")
        .attr("transform", "translate(15,9)")

    // Render the annotation
    d3.select("svg").append("g")
        .attr("transform", "translate(50,50)")
        .attr("class", "line-annotation-group").call(d3.annotation().annotations(lineAnnotations));

    d3.select(".line-annotation-group").selectAll(".connector").attr("stroke", "white")
    d3.select(".line-annotation-group").selectAll(".connector-end").attr("stroke", quarterColors[allQuarters.indexOf(quarter)]).attr("fill", quarterColors[allQuarters.indexOf(quarter)])

    // Add event listener for the Quarter dropdown
    d3.select("#allQuarters")
    .on("change", function(e) {
        // Updates data and scales
        quarter = e.target.value;
        if (quarter !== "overall")
            lineData = d3.flatRollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear(), (d) => d.Quarter)
                            .filter((d) => d[1] === quarter)
        else
            lineData = d3.flatRollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear());
        yScale.domain([0, d3.max(lineData, function(d) { return quarter === "overall" ? d[1] : d[2]; })]);
        d3.select(".line-yAxis").transition().duration(1000).call(d3.axisLeft(yScale))
        
        //Updates line chart
        var line = d3.select(".line-chart").datum(lineData, function (d) { return d[0]; });

        line.enter()
        .append("path")
        .select(".line-chart")
        .merge(line)
        .transition()
        .duration(1000)
        .attr("fill", "none")
        .attr("stroke", quarterColors[allQuarters.indexOf(quarter)])
        .attr("stroke-width", 4)
        .attr("d", d3.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(quarter !== "overall" ? d[2] : d[1]); })
        );

        // Updates annotation position
        annotationData = lineData.filter(function(d) { return d[0] === 2021 })[0];

        lineAnnotations = [{
            note: {
                label: "Due to the end of the COVID-19 pandemic, the schools resumed in-person learning which lead to a dramatic increase in school shootings.",
                title: "2021: Biggest School Shooting Peak",
                align: "middle",
                wrap: 200,
                padding: 15
            },
            x: xScale(annotationData[0]),
            y: yScale(quarter !== "overall" ? annotationData[2] : annotationData[1]),
            type: d3.annotationLabel,
            color: ["white"],
            dy: quarter === "Spring" ? -40 : 0,
            dx: quarter === "Winter" ? -400 : -162,
            connector: {
                end: "dot",
                type: "line",
                endScale: 5
            }
        }];

        var makeAnnotations = d3.annotation().annotations(lineAnnotations);
        d3.select(".line-annotation-group").call(makeAnnotations);
        d3.select(".line-annotation-group").selectAll(".connector-end")
        .attr("stroke", quarterColors[allQuarters.indexOf(quarter)])
        .attr("fill", quarterColors[allQuarters.indexOf(quarter)]);
    });
}

function createBarChart() {
    // Sets up location data and scales
    var locationRollup = d3.rollup(schoolShootingData.filter(s => s.Location_Type !== "" 
        && s.Location_Type !== "null" 
        && s.Location_Type !== "Unknown" 
        && s.Location_Type !== "ND"), 
        v => v.length, d => d.Location_Type);
    if (schoolLevel !== "All")
        locationRollup = d3.rollup(schoolShootingData.filter(s => s.Location_Type !== "" 
            && s.Location_Type !== "null" 
            && s.Location_Type !== "Unknown" 
            && s.Location_Type !== "ND"), 
            v => v.length, d => d.School_Level, d => d.Location_Type);
    var locData = schoolLevel !== "All" ? locationRollup.get(schoolLevel) : locationRollup;
    var xScale = d3.scaleBand()
    .domain([...locData.keys()].sort())
    .range([0, 700]).padding([0.2]);
    var yScale = d3.scaleLinear()
    .domain([0, d3.greatest(locData, d => d[1])[1]])
    .range([300, 0]);
    
    // Creates bar chart and axes
    d3.select("svg").append("g").attr("class", "barYAxis")
        .attr("transform", "translate(50,50)")
        .call(d3.axisLeft(yScale));

    d3.select("svg").append("g").attr("class", "barXAxis")
        .attr("transform", "translate(50,350)")
        .call(d3.axisBottom(xScale));

    d3.select("svg").append("g").attr("class", "barChart")
        .attr("transform", "translate(50,50)")
        .selectAll("rect")
        .data(locData, function(d) { return d[0] })
        .enter().append("rect")
        .attr("x", function(d, i) { return xScale(d[0]); })
        .attr("y", function(d, i) { return yScale(d[1]); })
        .attr("width", xScale.bandwidth)
        .attr("height", function(d, i) { return 300-yScale(d[1]); });
    
    // Sets up event listener to update the location data by school level
    d3.select("#schoolLevels")
    .on("change", function(e) {
        // Updates the location data by school level and scales
        schoolLevel = e.target.value;
        if (schoolLevel !== "All")
            locationRollup = d3.rollup(schoolShootingData.filter(s => s.Location_Type !== "" 
                && s.Location_Type !== "null" 
                && s.Location_Type !== "Unknown" 
                && s.Location_Type !== "ND"), 
                v => v.length, d => d.School_Level, d => d.Location_Type);
        else
            locationRollup = d3.rollup(schoolShootingData.filter(s => s.Location_Type !== "" 
                && s.Location_Type !== "null" 
                && s.Location_Type !== "Unknown" 
                && s.Location_Type !== "ND"), 
                v => v.length, d => d.Location_Type);
        locData = schoolLevel !== "All" ? locationRollup.get(schoolLevel) : locationRollup;
        xScale.domain([...locData.keys()].sort());
        yScale.domain([0, d3.greatest(locData, d => d[1])[1]])
        d3.select(".barYAxis").transition().duration(1000).call(d3.axisLeft(yScale))
        d3.select(".barXAxis").transition().duration(1000).call(d3.axisBottom(xScale))

        // Updates bar chart
        var bars =  d3.select(".barChart").selectAll("rect")
        .data(locData, function(d) { return d[0] })

        bars.enter().append("rect")
        .attr("x", function(d) { return xScale(d[0]); })
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("width", xScale.bandwidth)
        .attr("height", function(d) { return 300-yScale(d[1]); });

        d3.select(".barChart").selectAll("rect").transition().duration(1000)
        .attr("x", function(d) { return xScale(d[0]); })
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("width", xScale.bandwidth)
        .attr("height", function(d) { return 300-yScale(d[1]); })
        
        bars.exit().remove()
    })
}

function createSummaryLineChart() {
    var lineData = d3.flatRollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear());
    var dateExtent = d3.extent(lineData, function(d) { return d[0]; });
    var xScale = d3.scaleLinear().domain(dateExtent).range([0, 700]);
    var yScale = d3.scaleLinear().domain([0, d3.max(lineData, function(d) { return d[1]; })]).range([300, 0]);

    d3.select("svg")
    .append("text")
    .attr("x", 400)
    .attr("y", 400)
    .attr("dy", -15)
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .text("Year")

    d3.select("svg")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 200)
    .attr("dx", -200)
    .attr("dy", -185)
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .text("# of School Shootings")

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,50)")
    .attr("class", "summary-line-yAxis")
    .call(d3.axisLeft(yScale));

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,350)")
    .attr("class", "summary-line-xAxis")
    .call(d3.axisBottom(xScale).tickFormat(function (d) { return d.toString().replace(",", ""); }));

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,50)")
    .datum([lineData[0], lineData[lineData.length - 1]])
    .append("path")
    .attr("class", "summary-line-chart")
    .attr("fill", "none")
    .attr("stroke", "maroon")
    .attr("stroke-width", 6)
    .attr("d", d3.line()
        .x(function(d) { return xScale(d[0]); })
        .y(function(d) { return yScale(d[1]); })
    );
}