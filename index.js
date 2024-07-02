var scenes = ["scene-home", "scene-line-chart", "scene-map", "scene-random", "scene-thank-you"];

var sceneIndex = 0;

var us, schoolShootingData;

async function init() {
    us = await d3.json("https://d3js.org/us-10m.v1.json");
    
    schoolShootingData = await d3.csv("./school_shootings_1970-2022.csv");
    schoolShootingData.forEach(function (d) {
        d.Date = d3.timeParse("%Y-%m-%d")(d.Date);
    });
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
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
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
    var stateValue = schoolShootingData.map((d) => d.State).sort()
    var dataMap = d3.rollup(schoolShootingData, (v) => v.length, (d) => d.State);
    var colorScheme = d3.scaleThreshold().domain([10, 50, 100, 150, 200, 150, 300]).range(d3.schemeReds[8]);

    console.log(stateValue, dataMap);

    var path = d3.geoPath();

    d3.select("svg").selectAll("path")
    .data(states)
    .enter().append("path")
    .attr("fill", function(d) { console.log(d.id); return colorScheme(dataMap.get(stateValue[d.id]) || 0); })
    .attr("d", path);
    
    d3.select("svg").append("path")
    .datum(borders)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "darkgray")
    .attr("stroke-linejoin", "round");
}

async function createLineChart() {
    var lineData = d3.flatRollup(schoolShootingData, (v) => v.length, (d) => d.Date.getFullYear());
    var xScale = d3.scaleLinear().domain(d3.extent(lineData, function(d) { return d[0]; })).range([0, 700]);
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