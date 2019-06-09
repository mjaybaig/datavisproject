var width = document.getElementById('fsvgcont').clientWidth;
var height = document.getElementById('fsvgcont').clientHeight;
var COLLAPSE_LEVEL = 1;
var root;
var force = d3.layout.force()
.linkDistance(100)
.charge(-1000)
.gravity(0.2)
.size([width, height])
.on("tick", tick);

var svg = d3.select("#mainsvg");

var link = svg.selectAll(".link");
var node = svg.selectAll(".node");
var t = svg.selectAll(".t-node");

var margin = {top: 20, right: 20, bottom: 30, left: 80}
var otherwidth = document.getElementById('othersvg').clientWidth - margin.left - margin.right;
var otherheight = document.getElementById('othersvg').clientHeight - margin.top - margin.bottom;

// // setup x 
// var xValue = function(d) { return d.startYear;}, // data -> value
//     xScale = d3.scale.linear().range([0, otherwidth]), // value -> display
//     xMap = function(d) { return xScale(xValue(d));}, // data -> display
//     xAxis = d3.svg.axis().scale(xScale).orient("bottom");



// setup y
var yValue = function(d) { return d["moviescore"];}, // data -> value
    yScale = d3.scale.linear().range([otherheight, 0]), // value -> display
    // yMap = function(d) { return -1 * yScale(yValue(d));}, // data -> display
    // yMap = function(d) { return -1 * yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");


// setup fill color
var cValue = function(d) { return d.startYear;},
    mcolor = d3.scale.category10();
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function toggle(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  }   

window.onload = function(){
    d3.json("jsongenres.json", function(groupdata){

        // group
        // console.log(groupdata)
        // get top 20
        var genres = groupdata.children
                    .sort(function(x, y){
                        // console.log(x, y)
                        let xsum = 0
                        let ysum = 0
                        for(var child of x.children){
                            xsum += parseInt(child.numbers)
                        }
                        for(var child of y.children){
                            ysum += parseInt(child.numbers)
                        }
                        return d3.descending(xsum, ysum)
                    }).slice(0, 20)
        // var groupbygenre = d3.nest()
        //     .key(function(d){
        //         return d.genres
        //     })
            // .rollup(function(v){
            //     let sum = 0
            //     for(r of v){
            //         sum += parseInt(r["numbers"])
            //     }
            //     return sum;
            // })
            // .entries(genres.filter(function(el){
                // console.log(el)
            //     return el.numbers > 10
            // }))
            // .sort(function(x, y){
            //     return d3.descending(x.value, y.value);
            // }).slice(0, 20);
            // console.log(groupdata)

            groupdata.children = genres
            console.log(genres)
            // groupbygenre = groupbygenre.sort(function(x, y){
                //     return d3.descending(x.value, y.value);
                // }).slice(0, 20);
                
                // // Map to colors
                // console.log(groupbygenre)
                        // for(i of groupdata.children){
                        //     console.log(i)
                        // }
                    
        // var width = 960;
        // var height = 500;
        
        
        root = groupdata;
        console.log(root)
        function parseLevel(node, level) {
            node.level = level;
            var name;
            if(node.level == 1){
                name = node.name;
            }
            if (typeof node.children !== 'undefined') {

              node.children.forEach(function(children) {
                  children.parent = name;
                parseLevel(children, level + 1);
              });
            }
          }
  
          parseLevel(root, 0);
  
  
  
         // console.log(JSON.stringify(root, null, 2));
  
  
  
        update();
        function toggleAll(d) {
          if (d.children) {
            d.children.forEach(toggleAll);
            if (d.level < COLLAPSE_LEVEL){
              return;
            }
            toggle(d);
          }
        }
        // Initialize the display to show a few nodes.
        root.children.forEach(toggleAll);
        update();
    });
}

function update() {
    var nodes = flatten(root).slice(0, -1),
        links = d3.layout.tree().links(nodes);
    // console.log(nodes);
    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();
  
    // Update the links…
    link = link.data(links, function(d) { return d.target.id; });
  
    // Exit any old links.
    link.exit().remove();
  
    // Enter any new links.
    link.enter().insert("line", ".node")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  
    // Update the nodes…
    node = node.data(nodes, function(d) { return d.id; }).style("fill", color);
  
    // Exit any old nodes.
    node.exit().remove();
  
    // Enter any new nodes.
    node.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { 
            // console.log(d)
            var total = 0;
            if(d["children"] && d["children"].length > 0){
                for(child of d["children"]){
                    total += child["numbers"]
                }
            }else{
                total = d.numbers; 
            }
            return Math.sqrt(total)/10 || 4.5;
        })
        .style("fill", color)
        .on("click", click)
        .call(force.drag);
        
        t = t.data(nodes, function(d) { return d.id; })
            .style("fill", color);

        // Enter any new nodes.
        t.enter().append("svg:text")
        .attr("class", "t-node")
        .attr("dx", "25px")
        .attr("y", 0)
        .text(function(d){
            if(d.level <= 1){
                return d.name;
            }
            else {
                let yearnum = parseInt(d.year.substr(0, 4)) - 4
                let nextYear = yearnum + 20
                let bintext = yearnum + " - " + nextYear
                return bintext
            }
        })
        .on("click", click)
        .call(force.drag);

        // Exit any old nodes.
        t.exit().remove();
  }
  
  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    t.attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; }); 
  }
  
  // Color leaf nodes orange, and packages white or blue.
  function color(d) {
    return d._children ? "#9b0535" : d.children ? "#86ff3a" : "#00dcff";
  }
  
  // Toggle children on click.
  function click(d) {
      console.log(d)
    if (!d3.event.defaultPrevented) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      if(d.level > 1){
            
          $.getJSON(`/data/year=${d.year}&parent=${d.parent}`, function(data){
              drawPlot(data);
            })
            //   console.log(d.year, d.parent);
        }
    }
    update();
}

function drawPlot(data){
        if(!data || data.length < 1){
            console.log("Empty Values returned. Try something else")
            return
        }
        // setup x 
        data.forEach(function(d){
            console.log(d);
            d.year = d3.time.format("%Y-%m-%d").parse(d.startYear);
        })
        var dataXrange = d3.extent(data, function(d){return d.year})
                // maximum date range allowed to display
        var mindate = dataXrange[0],  // use the range of the data
        maxdate = dataXrange[1];


        var DateFormat	  =  d3.time.format("%Y");

        var dynamicDateFormat = timeFormat([
            [d3.time.format("%Y"), function() { return true; }],// <-- how to display when Jan 1 YYYY
            [d3.time.format("%b %Y"), function(d) { return d.getMonth(); }],
            [function(){return "";}, function(d) { return d.getDate() != 1; }]
        ]);

        console.log(data)
        if(document.getElementById('othsvg') && document.getElementById('othsvg').childElementCount > 0){
            for(let i of document.getElementById('othsvg').children){
                console.log(i);
                document.getElementById('othsvg').removeChild(i);
            }
        }
        var othersvg = d3.select('#othsvg')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        console.log(document.getElementById('othsvg'))
        data.forEach(function(d) {
            d.averageRating = +d.averageRating;
            d["profit"] = +d["profit"];
            //    console.log(d);
        });
        // don't want dots overlapping axis, so add in buffer to data domain
        // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
        yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
        
        
        /* === Context chart === */

        var margin_context = {top: 320, right: 30, bottom: 20, left: 20},
        height_context = otherheight - margin_context.top - margin_context.bottom;
        
        var x = d3.time.scale()
            .range([0, (otherwidth)])
            .domain(dataXrange);

        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
                .tickSize(-(otherheight))
            .ticks(d3.time.year, 1)
            .tickFormat(DateFormat);


        /* === Context Chart === */            
        var x2 = d3.time.scale()
            .range([0, otherwidth])
            .domain([mindate, maxdate]);

        var y2 = d3.scale.linear()
            .range([height_context, 0])
            .domain(yScale.domain());

        var xAxis_context = d3.svg.axis()
            .scale(x2)
            .orient("bottom")
            .ticks(customTickFunction)
            .tickFormat(DateFormat);


        // x-axis
        othersvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + otherheight + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", otherwidth)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Year");
        
        // y-axis
        othersvg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("P(NR) Score");
        // console.log(x(da))
        console.log(x(data[0].year))
            // draw dots
        othersvg.selectAll(".dot")
                .data(data)
                .enter().append("text")
                .attr("class", "dot")
                //   .attr("r", 3.5)
                .attr("x", function(d){ 
                    var max = 50
                    var min = -50
                    var offset = Math.random() * (+max - +min) - +min;
                    return x(d.year) + offset
                })
                .attr("y", function(d) {
                    return yScale(d.moviescore) 
                })
        // .attr('transform', 'rotate(30)')
            .attr("stroke-width", 0.2)
            .attr("fill-opacity", 0.6)
            .text(function(d){
                return d.originalTitle;
            })
            .style("fill", function(d) { return mcolor(cValue(d));}) 
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.8);
                    var eX = d3.event.pageX;
                    var eY = d3.event.pageY; 
                tooltip.html(`
                    <div class="card text-white bg-success mb-3" style="max-width: 18rem;">
                        <div class="card-header">${d["originalTitle"]}(${d.year.getFullYear()})</div>
                        <div class="card-body">
                        <h5 class="card-title"> Average Rating: ${d.averageRating}</h5>
                        <p class="card-text"> Total Votes: ${d.numVotes}</p>
                        <p class="card-text"> Profit: ${d.profit > 0? d.profit: 'N/A'}</p>
                        </div>
                    </div>
                    `)
                    .style("left", eX + "px")
                    .style("top", eY - 20 + "px");
                    console.log(d3.event.pageY, tooltip.attr('clientHeight'));
                    console.log(d3.event.pageY - tooltip.attr('height'));
            })
            .on("click", function(d){
                window.open(`http://imdb.com/title/${d.tconst}`, '_blank')
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
        });
        
        // // draw legend
        // var legend = othersvg.selectAll(".legend")
        //     .data(mcolor.domain())
        //     .enter().append("g")
        //     .attr("class", "legend")
        //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        
        // // draw legend colored rectangles
        // legend.append("rect")
        //     .attr("x", width - 18)
        //     .attr("width", 18)
        //     .attr("height", 18)
        //     .style("fill", mcolor);
        
        // // draw legend text
        // legend.append("text")
        //     .attr("x", width - 24)
        //     .attr("y", 9)
        //     .attr("dy", ".35em")
        //     .style("text-anchor", "end")
        //     .text(function(d) { return d;})

        //     $('html, body').animate({
        //         scrollTop: $('#othsvg').offset().top
        //     }, 800, function(){
        //     // Add hash (#) to URL when done scrolling (default click behavior)
        //         window.location.hash = '#othsvg';
        //     });

  }

  $(document).ajaxStart(function() {
    $(document.body).css({'cursor' : 'wait'});
}).ajaxStop(function() {
    $(document.body).css({'cursor' : 'default'});
});
function customTickFunction(t0, t1, dt)  {
    var labelSize = 42; //
    var maxTotalLabels = Math.floor(width / labelSize);

    function step(date, offset)
    {
        date.setMonth(date.getMonth() + offset);
    }

    var time = d3.time.month.ceil(t0), times = [], monthFactors = [1,3,4,12];

    while (time < t1) times.push(new Date(+time)), step(time, 1);
    var timesCopy = times;
    var i;
    for(i=0 ; times.length > maxTotalLabels ; i++)
        times = _.filter(timesCopy, function(d){
            return (d.getMonth()) % monthFactors[i] == 0;
        });

    return times;
}

function timeFormat(formats) {
    return function(date) {
      var i = formats.length - 1, f = formats[i];
      while (!f[1](date)) f = formats[--i];
      return f[0](date);
    };
  };

  // Returns a list of all nodes under the root.
  function flatten(root) {
    var nodes = [], i = 0;
  
    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      if (!node.id) node.id = ++i;
      nodes.push(node);
    }
  
    recurse(root);
    return nodes;
  }