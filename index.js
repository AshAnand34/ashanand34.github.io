var scenes = ["scene-home", "scene-line-chart", "scene-map", "scene-random", "scene-thank-you"];

var sceneIndex = 3;

var sliderYear = 1970;

var schoolLevel = "Elementary";

var us, schoolShootingData, stateMapping;

async function init() {
    us = await d3.json("https://d3js.org/us-10m.v1.json");
    schoolShootingData = await d3.csv("./school_shootings_1970-2022.csv");
    schoolShootingData.forEach(function (d) {
        d.Date = d3.timeParse("%Y-%m-%d")(d.Date);
    });
    stateMapping = await d3.csv("./states.csv");
    getCurrentScene();
}

function moveToNextScene() {
    d3.select("#left-arrow").attr("disabled", null);
    if (sceneIndex < scenes.length - 1) {
        sceneIndex++;
        getCurrentScene(sceneIndex - 1);
        d3.select("#" + scenes[sceneIndex])
        .style("transform", "translateX(1200px)")
        .transition().duration(1000)
        .style("transform", "translateX(0px)");
    }
}

function moveToPreviousScene() {
    d3.select("#right-arrow").attr("disabled", null);
    if (sceneIndex > 0) {
        sceneIndex--;
        getCurrentScene(sceneIndex + 1);
        d3.select("#" + scenes[sceneIndex])
        .style("transform", "translateX(-1200px)")
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
            d3.select("#left-arrow").attr("disabled", true);
            d3.select(".mainContent").attr("id", scenes[sceneIndex]).append("h1")
            .text("School Shootings Data Visualization");
            d3.select("#" + scenes[sceneIndex]).append("p")
            .html(`From 1970 to 2002, there were about <b>2,069</b> school shootings with <b>684</b> 
            killed and <b>1,937</b> wounded. To see more details, click on the arrows below.`);
            break;
        case 1:
            d3.select(".mainContent")
            .attr("id", scenes[sceneIndex])
            .append("p")
            .text(`The number of school shootings fluctuated between 10 and 63 from 1970 to 2010.
                However, since then, it has been rapidly increasing with the highest being 251 in the year 2021.`);
            d3.select("#" + scenes[sceneIndex]).append("svg")
            .attr("width", 800).attr("height", 400)
            createLineChart();
            break;
        case 2:
            d3.select(".mainContent")
            .attr("id", scenes[sceneIndex])
            .append("p")
            .text(`From the map below, California, Texas, Florida and Illinois are 
                some of states that consistently have the greatest number of school shootings 
                although it depends on the crime rate at that specific year. 
                Toggle the slider below the map to see how the number of school shootings 
                for each state changed over the years.`);
            d3.select("#" + scenes[sceneIndex])
            .append("svg")
            .attr("width", 760).attr("height", 350);
            createMapChart();
            break;
        case 3:
            var schoolLevels = [...new Set(schoolShootingData.map(d => d.School_Level))].filter(s => s !== "" && s !== "null" && s !== "Unknown");
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
            .append("p").text("Random String ");
            d3.select("p").append("select")
            .attr("id", "schoolLevels").attr("name", "schoolLevels")
            .selectAll("option").data(schoolLevels)
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text(function(d) { return d; });
            d3.select("#" + scenes[sceneIndex])
            .append("svg")
            .attr("width", 760).attr("height", 400);
            createBarChart();
            break;
        case 4:
            d3.select("#right-arrow").attr("disabled", true);
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
            .append("h1").text("Thank you for listening");
            d3.select("#" + scenes[sceneIndex]).append("p").text("Hope you enjoyed this narrative visualiation. Stay safe.")
            break;
        default:
            break;
    }
}

function createMapChart() {
    var states = topojson.feature(us, us.objects.states);
    var borders = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
    var dataMap = d3.rollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear(), (d) => d.State);
    var colorScheme = d3.scaleLinear().domain([0, d3.greatest(dataMap.get(sliderYear), d => d[1])[1]]).range(["white", "maroon"]);
    var projection = d3.geoIdentity().fitSize([760-50,350-50], states)
    var path = d3.geoPath().projection(projection);
    var abbrevs = d3.sort(stateMapping, (d) => d.State).map(d => d.Abbreviation);
    var ansiDict = states.features.map(d => parseInt(d.id))
        .sort(function(a, b) { return a - b;})
        .map(function (d, i) { return [d, abbrevs[i]]; });

    var tooltip = d3.select("#" + scenes[sceneIndex])
        .append("div")
        .style("opacity", 0)
        .attr("class", "map-tooltip")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px");
    
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
        console.log(d);
        var stateANSI = ansiDict.filter(s => s[0] === parseInt(d.id))[0];
        tooltip
        .html(stateANSI[1] + " had " + (dataMap.get(sliderYear).get(stateANSI[1]) || 0) + " school shootings.")
        .style("top", `${d.y + tooltip.clientHeight/2}px`)
        .style("left", `${d.x + 35}px`);
    }).on("mouseleave", function(event, d) {
        tooltip.style("opacity", 0);
    });
    
    d3.select("svg").append("path")
    .datum(borders)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "darkgray")
    .attr("stroke-width", 1.5);
    
    d3.select("#" + scenes[sceneIndex])
    .append("caption")
    .text("US Choropleth Map of School Shootings in " + sliderYear);

    d3.select("#" + scenes[sceneIndex])
    .append("input")
    .attr("type", "range")
    .attr("min", 1970)
    .attr("max", 2022)
    .attr("step", 1)
    .attr("value", sliderYear)
    .on("input", function (e) {
        sliderYear = parseInt(e.target.value);
        console.log(d3.greatest(dataMap.get(sliderYear), d => d[1]));
        colorScheme = d3.scaleLinear().domain([0, d3.greatest(dataMap.get(sliderYear), d => d[1])[1]]).range(["white", "maroon"]);
        d3.selectAll("path.states")
        .transition().duration(150)
        .attr("fill", function(d) {
            var stateANSI = ansiDict.filter(s => s[0] === parseInt(d.id))[0];
            return colorScheme(dataMap.get(sliderYear).get(stateANSI[1]) || 0); 
        });
        d3.select("caption")
        .text("US Choropleth Map of School Shootings in " + sliderYear);
    })
}

function createLineChart() {
    var lineData = d3.flatRollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear());
    var dateExtent = d3.extent(lineData, function(d) { return d[0]; });
    var xScale = d3.scaleLinear().domain(dateExtent).range([0, 700]);
    var yScale = d3.scaleLinear().domain([0, d3.max(lineData, function(d) { return d[1]; })]).range([300, 0]);

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
        y: yScale(annotationData[1]),
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

    const makeLineAnnotations = d3.annotation().annotations(lineAnnotations);
    
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
    .call(d3.axisLeft(yScale));

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,350)")
    .call(d3.axisBottom(xScale).tickFormat(function (d) { return d.toString().replace(",", ""); }));

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,50)")
    .append("path")
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", "maroon")
    .attr("stroke-width", 1)
    .attr("d", d3.line()
        .x(function(d) { return xScale(d[0]); })
        .y(function(d) { return yScale(d[1]); })
    );

    d3.select("svg").append("g")
        .attr("transform", "translate(50,50)")
        .attr("class", "line-annotation-group").call(makeLineAnnotations);

    d3.select(".line-annotation-group").selectAll(".connector").attr("stroke", "white")
    d3.select(".line-annotation-group").selectAll(".connector-end").attr("stroke", "maroon").attr("fill", "maroon")
}

function createBarChart() {
    var locationRollup = d3.rollup(schoolShootingData.filter(s => s.Location_Type !== "" 
        && s.Location_Type !== "null" 
        && s.Location_Type !== "Unknown" 
        && s.Location_Type !== "ND"), 
        v => v.length, d => d.School_Level, d => d.Location_Type);
    var xScale = d3.scaleBand()
    .domain([...locationRollup.get(schoolLevel).keys()].sort())
    .range([0, 660]).padding([0.2]);
    var yScale = d3.scaleLinear()
    .domain([0, d3.greatest(locationRollup.get(schoolLevel), d => d[1])[1]])
    .range([300, 0]);

    d3.select("svg").append("g").attr("class", "barYAxis")
        .attr("transform", "translate(50,50)")
        .call(d3.axisLeft(yScale));

    d3.select("svg").append("g").attr("class", "barXAxis")
        .attr("transform", "translate(50,350)")
        .call(d3.axisBottom(xScale));

    d3.select("svg").append("g").attr("class", "barChart")
        .attr("transform", "translate(50,50)")
        .selectAll("rect")
        .data(locationRollup.get(schoolLevel), function(d) { return d[0] })
        .enter().append("rect")
        .attr("x", function(d, i) { return xScale(d[0]); })
        .attr("y", function(d, i) { return yScale(d[1]); })
        .attr("width", xScale.bandwidth)
        .attr("height", function(d, i) { return 300-yScale(d[1]); });

    d3.select("select")
    .on("change", function(e) {
        schoolLevel = e.target.value;
        xScale.domain([...locationRollup.get(schoolLevel).keys()].sort());
        yScale.domain([0, d3.greatest(locationRollup.get(schoolLevel), d => d[1])[1]])
        d3.select(".barYAxis").transition().duration(1000).call(d3.axisLeft(yScale))
        d3.select(".barXAxis").transition().duration(1000).call(d3.axisBottom(xScale))

        var bars =  d3.select(".barChart").selectAll("rect")
        .data(locationRollup.get(schoolLevel), function(d) { return d[0] })

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