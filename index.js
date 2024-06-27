var scenes = ["scene-home", "scene-map", "scene-chart", "scene-random", "scene-thank-you"];

var sceneIndex = 0;

function moveToNextScene() {
    d3.select("#left-arrow").attr("disabled", null);
    if (sceneIndex < scenes.length - 1) {
        d3.select("#" + scenes[sceneIndex])
        .style("transform", "translateX(0px)")
        .transition().duration(1000)
        .style("transform", "translateX(-1200px)")
        .style("opacity", 0);
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
        d3.select("#" + scenes[sceneIndex])
        .style("transform", "translateX(0px)")
        .transition().duration(1000)
        .style("transform", "translateX(1200px)")
        .style("opacity", 0);
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
            .append("svg")
            .attr("width", 1000).attr("height", 800)
            .append("g").attr("transform", "translate(50,50)");
            d3.csv("./data/school_shootings_1970-2022.csv").then(function (data) {
                console.log(data);
            });
            break;
        case 2:
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
            .append("p").text("PlaceHolder");
            break;
        case 3:
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
            .append("p").text("Random String");
            break;
        case 4:
            d3.select("#right-arrow").attr("disabled", true);
            d3.select(".mainContent").attr("id", scenes[sceneIndex])
            .append("h1").text("Thank you for listening");
            break;
        default:
            break;
    }
}