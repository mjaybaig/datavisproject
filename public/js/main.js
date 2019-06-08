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
                        console.log(x, y)
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
    console.log(nodes);
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
        .on("click", click);
        // .call(force.drag);

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
              console.log(data);
          })
        //   console.log(d.year, d.parent);
      }
    }
    update();
  }
  
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