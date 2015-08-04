var PINK = "#ec008c"
var BLUE = "#1696d2"
var DARK_GREY = "#868686"
var LIGHT_GREY = "#efefef"
var PRISONERS = d3.format(",f")
var DATE = d3.time.format("%b, %Y")
var PERCENT = d3.format("%")
var isMobile = (d3.select(".mobile.logo").style("display") == "block")
var stateMenu = (isMobile) ? ".styled-select.state.mobile" : ".styled-select.state:not(.mobile)";
function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}
var isIE = detectIE();
var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
if (isFirefox){
  d3.selectAll(".filter select").style("pointer-events","visible")
}
if(isMobile){d3.select("#chart").style("height","400px")}

if(isMobile){
  d3.select(".summary")
    .html("Down \<span id = \"amount\"\>\<\/span\> by December 2021, compared with the baseline projection.")
}
if(!isMobile){
  d3.select(window).on('resize', function(){
    var activeState = d3.select(stateMenu + " select").node().value;
    drawGraphic(activeState)
  });
}
  function allPossibleCases(arr) {
  if (arr.length == 1) {
    return arr[0];
  }
  else if (arr.length == 0){
    return arr;
  } else {
    var result = [];
    var allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array
    for (var i = 0; i < allCasesOfRest.length; i++) {
      for (var j = 0; j < arr[0].length; j++) {
        result.push(arr[0][j] + allCasesOfRest[i]);
      }
    }
    return result;
  }

}
function hideTooltip(){
  d3.select("#tooltip")
    .transition()
    .delay(1000)
    .duration(1000)
    .style("left", "3000px")
}
function drawTooltip(offender, reduction, amount){
    // console.log(d3.select("#tooltip"))
  
  // var isMobile = (d3.select(".mobile.logo").style("display") == "none")
  // console.log(d3.select(".mobile.logo").style("display"), isMobile)
  var left = (isMobile) ? "17px" : "330px";
  d3.select("#tooltip")
    .transition()
    .style("left", left)
  if(offender == "actual"){
    d3.select(".summary")
      .style("display", "none")
    d3.selectAll("#tooltip .proj").style("display", "none")
    d3.select("#tooltip .other")
      .style("display","block")
      .text("These data represent observed historical prison populations.")
    d3.select(".defaultSummary")
      .style("display", "none")
  }
  else if(offender == "noPolicy"){
    d3.select(".defaultSummary")
      .style("display", "block")
    d3.select(".summary")
      .style("display", "none")
      // .text("")
    d3.selectAll("#tooltip .proj").style("display", "none")
    d3.select("#tooltip .other")
      .style("display","block")
      .text("These data represent projected prison populations, based on trends in admission rates and lengths of stay.")
  } else { 
    d3.select(".defaultSummary")
      .style("display", "none")
    d3.selectAll("#tooltip .proj").style("display", "block")
    d3.select("#tooltip .other").style("display","none")
    d3.select("#tooltip .offender").text(d3.select("option[value=\'" + offender + "\']").text())
    d3.select("#tooltip .reduction").text(d3.select("option[value=\'" + reduction + "\']").text())
    d3.select("#tooltip .amount").text(d3.select("option[value=\'" + amount + "\']").text())

  d3.select(".summary")
    .style("display", "block")
  // d3.select(".defaultSummary #amount")
  d3.select(".summary #amount")
    .text(function(){
      var state = d3.select(stateMenu + " select").node().value;
      var val2022 = d3.select(("g." + offender + "." + reduction + "." + amount + " .mouseoverText.Dec2021.val")).text();
      var valBase = d3.select((".xLabel.Dec2021.val")).text();
      valBase = parseFloat(valBase.replace(",",""));
      val2022 = parseFloat(val2022.replace(",",""));
      numDiff = val2022 - valBase
      numDiff = Math.abs(numDiff)
      var percentDiff = numDiff/valBase
      var percent = d3.format("%")
      return PRISONERS(numDiff) + " (" + percent(percentDiff) + ")"
    })
  }
  // console.log(  d3.select(".summary #amount").text())

}
function selectSeries(offender, reduction, amount){
  d3.select(".styled-select.offender-type select").node().value = offender;
  d3.select(".styled-select.reduction-type select").node().value = reduction;
  d3.select(".styled-select.amount-type select").node().value = amount;


  if(offender == "" && reduction == "" && amount == ""){

    d3.selectAll(".noPolicy").classed("selected", true)
    // d3.selectAll(".noPolicy.highlighted").classed("highlighted", false)

    d3.selectAll(".trigger").classed("highlighted", true)
    d3.selectAll(".line:not(.actual):not(.noPolicy)").classed("highlighted", true).transition().duration(1000).style("stroke", DARK_GREY)
    d3.selectAll(".dot:not(.actual):not(.noPolicy)").classed("highlighted", true).transition().duration(1000).style("fill", DARK_GREY)
    d3.selectAll(".menuSelected").classed("menuSelected", false)
    // hideTooltip();
    drawTooltip("noPolicy","","")
  }
  else{
    hideTooltip();
    var newColor = (offender !== "" && reduction !== "" && amount !== "") ? PINK : DARK_GREY;
    var newClass = (offender !== "" && reduction !== "" && amount !== "") ? "menuSelected" : "highlighted";
    if (offender !== "" && reduction !== "" && amount !== ""){ drawTooltip(offender, reduction, amount)}

    var offenders = [".violent", ".nonviolent", ".all", ".drug", ".property", ".revocation"]
    var reductions = [".new", ".length"]
    var amounts = [".five", ".fifteen", ".twentyFive", ".fifty"]
    var vars = [];

    if(offender !== ""){ offender = "." + offender; vars.push(offenders)}
    if(reduction !== ""){ reduction = "." + reduction; vars.push(reductions)}
    if(amount !== ""){ amount = "." + amount; vars.push(amounts)}
    var combination = offender + reduction + amount;
    combinations = allPossibleCases(vars)
    var index = combinations.indexOf(combination);
    temp = combinations;
    temp.splice(index, 1)

    for (var i = 0; i < temp.length; i++){
        d3.selectAll(".line" + temp[i])
          .transition()
          .duration(1000)
          .style("stroke", LIGHT_GREY)
        d3.selectAll(".dot" + temp[i])
          .transition()
          .duration(1000)
          .style("fill", LIGHT_GREY)
    }
    d3.selectAll(".line" + combination)
      .transition()
      .duration(1000)
      .style("stroke", newColor)
    d3.selectAll(".dot" + combination)
      .transition()
      .duration(1000)
      .style("fill", newColor)

    setTimeout(function(){
      // console.log(temp)
      d3.selectAll(".menuSelected").classed("menuSelected", false)
      for(var j = 0; j < temp.length; j++){
        d3.selectAll(temp[j])
          .classed("highlighted", false);
        d3.selectAll(temp[j] + " .trigger")
          .classed("highlighted", false);
        d3.selectAll(".selected")
          .classed("selected", false);

        // console.log(combination, newClass)
        d3.selectAll(combination)
          .classed(newClass, true);
        d3.selectAll(combination + " .trigger")
          .classed(newClass, true);
        d3.selectAll(combination).each(function() { this.parentNode.parentNode.appendChild(this.parentNode); });
        d3.selectAll(".noPolicy").each(function() { this.parentNode.parentNode.appendChild(this.parentNode); });
      }
    }, 500);
  }

}
function drawGraphic(state){
    // var m = d3.select(this);
    // if(m.node().value == ""){
    //   m.style("color", "#818385")
    // }else{ m.style("color", "#333")}
  // console.log(state);
  var offenders = ["violent", "nonviolent", "all", "drug", "property", "revocation"]
  var reductions = ["new", "length"]
  var amounts = ["five", "fifteen", "twentyFive", "fifty"]

  d3.select("#chart svg").remove();
  var isMobile = (d3.select(".mobile.logo").style("display") == "block")
  var leftMargin = (isMobile) ? 20 : 20;
  var margin = {top: 90, right: 50, bottom: 10, left: leftMargin};
  var width = (window.innerWidth - margin.left - margin.right > 1500) ? 1500 : window.innerWidth - margin.left - margin.right ;
  var height = window.innerHeight - margin.top - margin.bottom;

  // console.log(isMobile)
  if(isMobile){ height = height/2}

  var parseDate = d3.time.format("%b-%y").parse;


  var x = d3.time.scale()
      .range([0, width]);
  var y = d3.scale.linear()
      .range([height, 0]);

// var zoom = d3.behavior.zoom()

//     .on("zoom", draw);
//   zoom.y(y)

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("right")
      .tickFormat(function(d){
        return d/1000
      });
  var yRight = (window.innerWidth - margin.left - margin.right > 1500) ? (window.innerWidth - margin.left - margin.right-1500-10) : -10;
  d3.select("#yLabel")
    .style("right", yRight + "px")
    .text(function(){ var yText = (isMobile) ? "Statewide prison pop. (thousands)" : "Statewide prison population (thousands)"; return yText;})
  var line = d3.svg.line()
      .defined(function(d) { return d.series != 0; })
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.series); });

  var svg = d3.select("#chart").append("svg")
      .attr("class","hideAll")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")






  d3.csv("data/test_data.csv", function(error, data) {
    if (error) throw error;
    // console.log(data)
    data.forEach(function(d) {
      // console.log(d.date)
      d.date = parseDate(d.date);
    });

    var headers = d3.keys(data[0]).filter(function(key) { return (key !== "date" && key.indexOf("ALL_STATES") != -1); })
    var STATES = ["ALL_STATES","AL","GA","KY","MI","MN","MO","NJ","NY","OK","RI","SC","TX","UT","WA","WY"]
    var series = headers.map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          if(d[name] != ""){
            var values = {}
            values.date = d.date;
            values.series = d[name]
            values.ALL_STATES = d[name]
            for(var i = 0; i<= STATES.length; i++){
              values[STATES[i]] = d[name.replace("ALL_STATES", STATES[i])]
            }
            return values;
            // return {date: d.date, series: +d[name]};
          }
           else{
            return {date: null, series: null}
          }
        })
      };
    });


    x.domain(d3.extent(data, function(d) {
      return newDate = d3.time.month.offset(d.date, 0);
      // return d.date; 
    }));
    // console.log(series)
    y.domain([
      0,
      d3.max(series, function(c) { return d3.max(c.values, function(v) { return +v.series; }); })
      // 200000
    ]);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + (width+10) + ",0)")
        .attr("class", "y axis")
        .call(yAxis)
      // .append("text")
      //   .attr("transform", "rotate(-90)")
      //   .attr("y", 6)
      //   .attr("dy", ".71em")
      //   .style("text-anchor", "end")
      //   .text("")

    var ser = svg.selectAll(".series")
        .data(series)
      .enter().append("g")
        .attr("class", "series");

    series.forEach(function(arr){
      var dots = svg.append("g").selectAll(".dot")
          .data(arr.values)
          .enter().append("g")
          .attr("class", arr.name + " highlighted")

          // .style("display", function(){
          //   if (arr.name.indexOf(state) != -1){ return "block"}
          //   else{ return "none" }
          // })
        dots.append("circle")
          .attr("class", "trigger")
          .attr("cx", function(d){ return x(d.date)})
          .attr("cy", function(d){ return y(d.series)})
          .attr("r", 5)
          .attr("opacity", 0.0001)
          .attr("fill", "#fff")
          .on("mouseover", function(d){
            if(isIE){ 
            d3
              .selectAll(".mouseoverText")
              .attr("opacity", 0)
            d3
              .selectAll(".mouseoverBackground")
              .attr("opacity", 0)
            d3.selectAll(".dot.noPolicy")
              .style("fill","#333")
            d3.selectAll(".dot.highlighted")
              .style("fill",DARK_GREY)
            d3.selectAll(".dot")
              .style("radius",1.5)
            d3.selectAll(".line.noPolicy")
              .style("stroke","#333")
            d3.selectAll(".line.highlighted")
              .style("stroke",DARK_GREY)
              .style("stroke-width","1px")
            d3.selectAll(".selected")
              .classed("selected",false)
            d3.selectAll(".menuSelected")
              .classed("menuSelected",false)

            }
            // console.log(d)
           var parent = d3.select(d3.select(this).node().parentNode)
      //append "grandparent" g element to "greatgrandparent" so that the tooltips are above both the series and the dots
           parent.node().parentNode.parentNode.appendChild(parent.node().parentNode)
           parent
              .selectAll("text:not(.xLabel)")
              .transition()
              .duration(100)
              .attr("opacity", 1)
           parent
              .selectAll("rect")
              .transition()
              .duration(200)
              .attr("opacity", .9)

            // parent
            //   .select(".dot")
            //   .transition()
            //   .duration(200)
            //   .attr("r",5)
              // .style("fill", PINK)
            // setTimeout(function(){
              var offender, reduction, amount;
              for (var o = 0; o < offenders.length; o++){
                if (parent.select(".dot").classed(offenders[o])) { offender = offenders[o]}
              }
              for (var r = 0; r < reductions.length; r++){
                if (parent.select(".dot").classed(reductions[r])) { reduction = reductions[r]}
              }
              for (var a = 0; a < amounts.length; a++){
                if (parent.select(".dot").classed(amounts[a])) { amount = amounts[a]}
              }

              if (parent.select(".dot").classed("actual")){ drawTooltip("actual", null, null)}
              else if (parent.select(".dot").classed("noPolicy")){ drawTooltip("noPolicy", null, null)}
              else { drawTooltip(offender, reduction, amount) }
            
              parent.select(".dot").classed("selected", true)
            
            var baseClass = parent.select(".dot").attr("class").replace(/ /g,".").replace(".selected","").replace(".highlighted","").replace("dot","")
            d3.selectAll(".dot" + baseClass)
              .transition()
              .style("fill", PINK)

              .attr("r",function(d2){
                if(x(d.date) == d3.select(this).attr("cx")){ return 5}
                else{ return 1.5}
                // console.log(d);
                // console.log("this", this)

              });
            
            d3.select("path" + baseClass)
              .transition()
              .style("stroke", PINK )
              .style("stroke-width", "2px")
            // setTimeout(function(){
              d3.select("path" + baseClass).classed("selected", true)
            // }, 400);

            // .classed("selected", true)

              
          })
          .on("mouseout", function(d){
            if(d3.selectAll(".menuSelected").node() !== null){
              for (var o = 0; o < offenders.length; o++){
                if (d3.select(".menuSelected").classed(offenders[o])) { offender = offenders[o]}
              }
              for (var r = 0; r < reductions.length; r++){
                if (d3.select(".menuSelected").classed(reductions[r])) { reduction = reductions[r]}
              }
              for (var a = 0; a < amounts.length; a++){
                if (d3.select(".menuSelected").classed(amounts[a])) { amount = amounts[a]}
              }
              drawTooltip(offender, reduction, amount)
            } else{
              hideTooltip();
              // d3.selectAll(".line.noPolicy").style("stroke",PINK)
              // selectSeries("","","")
              // drawTooltip("noPolicy","","")
            }
            // console.log(d)
            var parent = d3.select(d3.select(this).node().parentNode)
            // console.log(parent)

            parent
              .selectAll(".mouseoverText")
              .transition()
              .duration(100)
              .attr("opacity", 0)
            parent
              .selectAll(".mouseoverBackground")
              .transition()
              .duration(200)
              .attr("opacity", 0)
            d3
              .selectAll(".selected")
              .classed("selected", false)
              .transition()
              .attr("r",1.5)
              .style("fill", function(){
                if(d3.select(this).classed("actual")) { return BLUE}
                else if(d3.select(this).classed("noPolicy")){ return "#333333" }
                else if(d3.select(this).classed("menuSelected")){ return PINK }
                else { return DARK_GREY }      
              });

            var baseClass = parent.select(".dot").attr("class").replace(/ /g,".").replace(".selected","").replace(".highlighted","").replace("dot","")
            d3.select("path" + baseClass)
              .transition()
              .style("stroke", function(){
                if(d3.select(this).classed("actual")) { return BLUE}
                else if(d3.select(this).classed("noPolicy")){ return "#333333" }
                else if(d3.select(this).classed("menuSelected")){ return PINK }
                else { return DARK_GREY }
              })
              .style("stroke-width", function(){
                var sw = (d3.select(this).classed("actual") || d3.select(this).classed("noPolicy")) || d3.select(this).classed("menuSelected") ? "2px" : "1px";
                return sw;
              })

            d3.selectAll(".dot" + baseClass)
              .transition()
              .style("fill", function(){
                if(d3.select(this).classed("actual")) { return BLUE}
                else if(d3.select(this).classed("noPolicy")){ return "#333333" }
                else if(d3.select(this).classed("menuSelected")){ return PINK }
                else { return DARK_GREY }
              })
              .attr("r", 1.5)
 
            // setTimeout(function(){
              d3.select("path" + baseClass).classed("selected", false)
            // }, 400);

              // .attr("fill", BLUE)
          })
          // .append("g")
          dots.append("circle")
            .attr("class", "dot highlighted " + arr.name)
            .attr("cx", function(d){ return x(d.date)})
            .attr("cy", function(d){ return y(d.series)})
            .attr("r", 1.5)
            .classed("selected", false)
          .style("display", function(d){
            if(d.series != 0){ return "block" }
            else{ return "none" }
            
          })
            // .attr("fill", BLUE)

          dots
            .append("rect")
            .attr("class", function(d){
              if(d.date !== null){
                return DATE(d.date).replace(",","").replace(/ /g,"") + " mouseoverBackground"
              } else{ return "mouseoverBackground"}
            })
            .attr("x", function(d){ return x(d.date) - 20})
            .attr("y", function(d){ return y(d.series) - 40})
            .attr("width", 70)
            .attr("height", 34)
            .attr("opacity", 0)
          dots
            .append("text")
            .attr("class", function(d){
              if(d.date !== null){
                return DATE(d.date).replace(",","").replace(/ /g,"") + " mouseoverText date"
              } else{ return "mouseoverText date"}
            })
            .text(function(d){
              if(d.date !== null){
                return DATE(d.date);
              }
            })
            .attr("x", function(d){ return x(d.date) })
            .attr("y", function(d) {return y(d.series)})
            .attr("dx", "-1em")
            .attr("dy", "-2em")
            .attr("opacity", 0)

          dots
            .append("text")
            .attr("class", function(d){
              // console.log(DATE)
              if(d.date !== null){
                return DATE(d.date).replace(",","").replace(/ /g,"") + " mouseoverText val"
              } else{ return "mouseoverText val"}
            })
            .text(function(d){
              if(d.date !== null){
                return PRISONERS(d.series);
              }
            })
            .attr("x", function(d){ return x(d.date) })
            .attr("y", function(d) {return y(d.series)})
            .attr("dx", "-1em")
            .attr("dy", "-1em")
            .attr("opacity", 0)

        // .attr("dy", ".71em")

    });

    // console.log(ser)

    ser.append("path")
        .attr("d", function(d) { return line(d.values); })
        // .style("display", function(d){
        //     if (d.name.indexOf(state) != -1){ return "block"}
        //     else{ return "none" }
        //   })
        // .style("display", function(){})
        .attr("class", function(d){
          if (d.name.indexOf("noPolicy") != -1){
            var terminalData;
            var terminalSeries;
            var terminalDate = d3.max(d.values, function(obj) {  terminalData = obj; terminalSeries = obj.series; return obj.date; });
            // var terminalSeries = d3.max(d.values, function(obj) { return obj.date; });
            d3.selectAll(".noPolicy .mouseoverText." + DATE(terminalDate).replace(",","").replace(/ /g,"")).classed("mouseoverText", false)
              .classed("xLabel last", true)
              .attr("text-anchor","end")
              .attr("dy",function(){
                var dy = parseInt(d3.select(this).attr("dy").replace("em",""))
                return (dy - 1) + "em"
              })
              .attr("x",function(){
                var dx = parseInt(d3.select(this).attr("x"))
                return dx+15
              })
            d3.select(".xLabel.last").text("Dec, 2021 (baseline)")
              // console.log(terminalSeries)
              d3.select(d3.select(".xLabel.last").node().parentNode)
                .append("line")
                .datum(terminalData)
                .attr("class", "labelLine last")
                .attr("x1",function(d){ return x(terminalDate) })
                .attr("x2",function(d){ return x(terminalDate) })
                .attr("y1",function(d){ return y(terminalSeries) - 20})
                .attr("y2",function(d){ return y(terminalSeries)})
                .style("stroke", "#000")
                // .style("stroke-width",100)
            d3.select(".labelLine.last").node().parentNode.appendChild(d3.select(".labelLine.last").node())
            d3.selectAll(d3.select(".xLabel").node().parentNode).selectAll(".trigger").style("pointer-events","none")

        //move permanent tooltip to the back, so nearby tooltips bg's go over it
            d3.select(".xLabel.last").node().parentNode.parentNode.insertBefore(d3.select(".xLabel.last").node().parentNode, d3.select(".xLabel.last").node().parentNode.parentNode.firstChild)
            // d3.selectAll(".mouseoverText.actual." + DATE(terminalDate).replace(",","").replace(/ /g,"")).remove();
            // d3.selectAll(".mouseoverBackground.actual." + DATE(terminalDate).replace(",","").replace(/ /g,"")).remove();

          }
          if ( d.name.indexOf("actual") != -1){
            d.values.filter(function(obj){return obj.series != "0"});
            var firstSeries, lastSeries;
            var lastDate = d3.max(d.values.filter(function(obj){return obj.series != "0"}), function(obj) { lastSeries = obj.series; return obj.date; });
            var firstDate = d3.min(d.values.filter(function(obj){return obj.series != "0"}), function(obj) { firstSeries = obj.series; return obj.date; });

            d3.selectAll(".actual .mouseoverText." + DATE(lastDate).replace(",","").replace(/ /g,"")).classed("mouseoverText", false)
              .classed("xLabel mid", true)
              .attr("dy",function(){
                var dy = parseInt(d3.select(this).attr("dy").replace("em",""))
                return (dy) + "em"
              })
              .attr("dx",function(){
                var dx = parseInt(d3.select(this).attr("dx").replace("em",""))
                return (dx) + "em"
              })
              .attr("text-anchor","end")

              svg.append("text")
                .attr("class", "projLabel")
                .attr("x", x(lastDate) + 30)
                .attr("y",function(){var pY = (isMobile) ? -55:-20; return pY;})
                .text("PROJECTIONS")
              d3.select(d3.select(".xLabel.mid").node().parentNode)
                .append("line")
                .attr("class", "dotted")
                .attr("x1",function(d){ return x(lastDate) })
                .attr("x2",function(d){ return x(lastDate) })
                .attr("y1",function(d){ return y(lastSeries) - 50})
                .attr("y2",function(d){ return y(lastSeries) + 140})
                .attr("stroke-dasharray", "2,5")
                .style("stroke", "#A7AAAD")
              d3.select(d3.select(".xLabel.mid").node().parentNode)
                .append("line")
                .attr("class", "labelLine")
                .attr("x1",function(d){ return x(d.date) })
                .attr("x2",function(d){ return x(d.date) })
                .attr("y1",function(d){ return y(d.series) - 20})
                .attr("y2",function(d){ return y(d.series)})
                .style("stroke", "#000")
              d3.select(d3.select(".xLabel.mid").node().parentNode)
                .append("line")
                .attr("class", "labelLine jag")
                .attr("x1",function(d){ return x(d.date) })
                .attr("x2",function(d){ return x(d.date)-10 })
                .attr("y1",function(d){ return y(d.series) - 20})
                .attr("y2",function(d){ return y(d.series) - 20})
                .style("stroke", "#000")
                // .style("fill","#000")
            d3.selectAll(".mouseoverText." + DATE(lastDate).replace(",","").replace(/ /g,"")).remove();
            d3.selectAll(".mouseoverBackground." + DATE(lastDate).replace(",","").replace(/ /g,"")).remove();
        //move permanent tooltip to the back, so nearby tooltips bg's go over it
            d3.select(".xLabel.mid").node().parentNode.parentNode.insertBefore(d3.select(".xLabel.mid").node().parentNode, d3.select(".xLabel.mid").node().parentNode.parentNode.firstChild)


            d3.selectAll(".actual .mouseoverText." + DATE(firstDate).replace(",","").replace(/ /g,"")).classed("mouseoverText", false)
              .classed("xLabel first", true)
              .attr("dy",function(){
                var dy = parseInt(d3.select(this).attr("dy").replace("em",""))
                return (dy - 1) + "em"
              })



            d3.select(d3.select(".xLabel.first").node().parentNode)
                .append("line")
                .attr("class", "labelLine first")
                .attr("x1",function(d){ return x(d.date) })
                .attr("x2",function(d){ return x(d.date) })
                .attr("y1",function(d){ return y(d.series) - 20})
                .attr("y2",function(d){ return y(d.series)})
                .style("stroke", "#000")


            d3.selectAll(d3.select(".xLabel").node().parentNode).selectAll(".trigger").style("pointer-events","none")

            d3.selectAll(".mouseoverText." + DATE(firstDate).replace(",","").replace(/ /g,"")).remove();
            d3.selectAll(".mouseoverBackground." + DATE(firstDate).replace(",","").replace(/ /g,"")).remove();

          }
          return "line highlighted " + d.name
        })
      d3.selectAll(".noPolicy").each(function() { this.parentNode.parentNode.appendChild(this.parentNode); });
      d3.selectAll(".highlighted.actual").classed("highlighted", false)
      d3.selectAll(".highlighted.noPolicy").classed("highlighted", false)

      changeState(state, "init")
      function changeState(state, trigger){
        d3.select(stateMenu + " select").node().value = state;
        // if(trigger == "inline" && state != "ALL_STATES" && state != "TX"){
        //   d3.selectAll(".actual")
        //     // .transition()
        //     .style("opacity",".2")
        // }
        // else{
        //   d3.selectAll(".actual")
        //     // .transition()
        //     .style("opacity","1")
        // }
    if(trigger != "init"){
        var stateName = d3.select("option[value="+state+"]").text();
        d3.select("#stateName")
          .text(function(){
            return stateName;
          })
        d3.select("#mobileStateName")
          .text(function(){
            return stateName;
          })
        d3.select(".summary #state")
          .text(function(){
            if(state == "ALL_STATES"){
              return "the aggregate"
            }
            return stateName + "\'s";
          })

        y.domain([
          0,
          d3.max(series, function(c) { return d3.max(c.values, function(v) { return +v[state]; }); })
          // 200000
        ]);

        d3.select(".y.axis").transition().duration(2200).call(yAxis)
        d3.selectAll(".line").transition().duration(1000).attr("d", function(d){
          var line = d3.svg.line()
            .defined(function(d) { return d[state] != 0; })
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(+d[state]); });
          return line(d.values)          
        })
        d3.selectAll(".mouseoverText")
          // .transition()
          .attr("y", function(d){
            // console.log(this)

              if(d3.select(this).classed("val")){
                // console.log(this, d)
                  d3.select(this).text(PRISONERS(d[state]))
              }
              return y(+d[state])
        })
        d3.selectAll(".mouseoverBackground")
          // .transition()
          .attr("y", function(d){
              return y(+d[state])-40
        })


        var firstSeries, firstDate;
        var first = data.filter(function(obj){return obj[state + " actual"] != 0})
        firstDate = first[0].date;
        firstSeries = first[0][state + " actual"];

        // var midSeries;
        // var first = data.filter(function(obj){return obj[state + " actual"] != 0})
        // firstDate = first[0].date;
        // firstSeries = first[0][state + " actual"];       

        // var lastSeries;
        // var first = data.filter(function(obj){return obj[state + " actual"] != 0})
        // firstDate = first[0].date;
        // firstSeries = first[0][state + " actual"];


        // d3.select(".xLabel.first")
        // .datum({"date": firstDate, "series": firstSeries})

        d3.selectAll(".labelLine")
          .attr("y1",function(d){ return y(+d[state]) - 20})
          .attr("y2",function(d){ return y(+d[state])})

        d3.selectAll(".labelLine.jag")
          .attr("y2",function(d){ return y(+d[state]) - 20})

        d3.selectAll(".xLabel")
          .transition()
          .attr("y", function(d){
              if(d3.select(this).classed("val")){
                d3.select(this).text(PRISONERS(d[state]))
              }
              // if(d3.select(this).classed("val")){
              return y(+d[state]);
          });
          // console.log(firstDate)
        // var a = d3.select()


        d3.selectAll(".xLabel.first")
          .transition()
          .attr("x", function(d){
            // console.log(firstDate, x(firstDate), firstSeries)
            return x(firstDate)
          })
          .attr("y", function(d){
            return y(firstSeries)
          });

        d3.select(".xLabel.first.date")
          .text(function(d){
            return DATE(firstDate);
          });
        d3.select(".xLabel.first.val")
          .text(function(d){
            return PRISONERS(firstSeries);
          });
        d3.select(d3.select(".xLabel.first").node().parentNode)
          .select("line")
          .attr("x1",function(d){ return x(firstDate) })
          .attr("x2",function(d){ return x(firstDate) })
          .attr("y1",function(d){ return y(firstSeries) - 20})
          .attr("y2",function(d){ return y(firstSeries)})
        // })
        d3.selectAll(".trigger").transition().attr("cy", function(d){
          if(d[state] !== 0){
            return y(+d[state])
          }
        })
        d3.selectAll(".dot")
          .style("display", function(d){
            if(d[state] != 0){ return "block" }
            else{ return "none" }
          })
          // .transition()
            // .duration(250)
            .attr("opacity",0)
          // .transition()
            // .duration()
            // .attr("opacity",1)
            .attr("cy", function(d){
          if(d[state] !== 0){
            return y(+d[state])
          }
        })
        .transition()
        .delay(600)
        .duration(1200)
        .attr("opacity",1)
        d3.select(".defaultSummary #defState")
        .text(function(){
            if(state == "ALL_STATES"){
              return "the states do"
            } else{
              return d3.select("option[value="+state+"]").text() + " does"
            }
        });

        d3.select(".defaultSummary #defAmount")
        .text(function(){
          var val2022 = d3.select((".xLabel.Dec2021.val")).text();
          return val2022;
        });
      }
    }
      d3.select(stateMenu + " select")
        .on("change", function(){
          var activeState = d3.select(stateMenu + " select").node().value;
          changeState(activeState, "menu");
      })
      d3.selectAll(".scenario")
        .on("click", function(){
          var params = d3.select(this).attr("id").split("-");
          var state = params[0];
          var offender = params[1];
          var reduction = params[2];
          var amount = params[3];
          // var state = "GA";
          var ms = (state == d3.select(stateMenu + " select").node().value) ? 0 : 1400;
          if (ms != 0){changeState(state, "inline")}
          setTimeout(function(){
            selectSeries(offender,reduction,amount);  
          }, ms)
          
        });
        d3.select(".refresh")
          .on("click", function(){
            selectSeries("","","")
          })
      // d3.select(".line.noPolicy").style("stroke", PINK)
// selectSeries("","","");
selectSeries(d3.select(".offender-type select").node().value, d3.select(".reduction-type select").node().value, d3.select(".amount-type select").node().value)

  });

}
var activeState = d3.select(stateMenu + " select").node().value;
drawGraphic(activeState);

d3.select("#hamburger img")
  .on("click", function(){
    d3.selectAll(".mobileHide").style("display", "block")
  })
d3.select("#mobileClose")
  .on("click", function(){
    d3.selectAll(".mobileHide").style("display", "none")
  })
$(".styled-select.filter").click(function () {
    var element = $(this).children("select")[0],
        worked = false;
    if(document.createEvent) { // all browsers
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false,       false, false, false, 0, null);
        worked = element.dispatchEvent(e);
    } else if (element.fireEvent) { // ie
        worked = element.fireEvent("onmousedown");
    }
    if (!worked) { // unknown browser / error
        alert("It didn't worked in your browser.");
    }
});

d3.selectAll(".styled-select.filter select")
  // .style("color", function(){
  //   console.log(d3.select(this).node().value)
  // })
  .on("change", function(){
    selectSeries(d3.select(".offender-type select").node().value, d3.select(".reduction-type select").node().value, d3.select(".amount-type select").node().value)
    var m = d3.select(this);
    if(m.node().value == ""){
      m.style("color", "#818385")
    }else{ m.style("color", "#333")}
  })
function checkReady() {
    var drawn = d3.select("#chart svg .series").node();
    if (drawn == null) {
        setTimeout("checkReady()", 300);
    } else {
        setTimeout(function(){
          if(!isIE){
            d3.select("#loading")
              .transition()
              .style("opacity", 0);
          }
          else if(isIE <= 10){
            d3.select("#stateImg").classed("ie", true);
            d3.select(".state.styled-select:not(.mobile)").classed("ie",true);
            d3.select("#loading").remove();
          }
          else{
            d3.select("#loading").remove();
          }
        },500);
    }
}
checkReady();