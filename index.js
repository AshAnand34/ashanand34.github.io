var scenes = ["scene-home", "scene-line-chart", "scene-map", "scene-random", "scene-thank-you"];

var sceneIndex = 0;

var sliderYear = 1970;

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
            d3.select(".mainContent")
            .attr("id", scenes[sceneIndex])
            .append("svg")
            .attr("width", 800).attr("height", 600)
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
            .attr("width", 960).attr("height", 600)
            createMapChart();
            break;
        case 3:
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
            .append("p").text("Random String");
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

async function createMapChart() {
    var states = topojson.feature(us, us.objects.states).features;
    var borders = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
    var dataMap = d3.rollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear(), (d) => d.State);
    var colorScheme = d3.scaleLinear().domain([0, d3.greatest(dataMap.get(sliderYear), d => d[1])[1]]).range(["white", "maroon"]);
    var path = d3.geoPath();
    var abbrevs = d3.sort(stateMapping, (d) => d.State).map(d => d.Abbreviation);
    var ansiDict = states.map(d => parseInt(d.id)).sort(function(a, b) { return a - b;})
        .map(function (d, i) { return [d, abbrevs[i]]; });

    var tooltip = d3.select("#" + scenes[sceneIndex])
        .append("div")
        .style("opacity", 0)
        .attr("class", "map-tooltip")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px");

    d3.select("svg").selectAll("path")
    .data(states)
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
        .html(stateANSI[1] + " had " + (dataMap.get(sliderYear).get(stateANSI[1]) || 0) + " school shootings.");
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

async function createLineChart() {
    var lineData = d3.flatRollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear());
    var dateExtent = d3.extent(lineData, function(d) { return d[0]; });
    var xScale = d3.scaleLinear().domain(dateExtent).range([0, 700]);
    var yScale = d3.scaleLinear().domain([0, d3.max(lineData, function(d) { return d[1]; })]).range([500, 0]);

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
    .attr("x", "400")
    .attr("y", "600")
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .text("Year")

    d3.select("svg")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 300)
    .attr("dx", -300)
    .attr("dy", -285)
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .text("# of School Shootings")

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,50)")
    .call(d3.axisLeft(yScale));

    d3.select("svg")
    .append("g")
    .attr("transform", "translate(50,550)")
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