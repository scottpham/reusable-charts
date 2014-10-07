 //globals
 var mobileThreshold = 350,
    aspect_width = 16,
    aspect_height = 9,
    pymChild = null;

var $graphic = $('#graphic');

var graphic_data;

//colors
var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};
/*
 * Render the graphic
 */

 var config = {
    'tickSize' : '10',
    'labelClass' : 'label'

 }

function draw_graphic(width){
    if (Modernizr.svg){
        $graphic.empty();

    render('graphic', width)
    }

}

function render(id, container_width) { //consider container width vs. graphic width

    //standard margins
    var margin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 50
    };

    var mobile = {};
     
    //check for mobile
    function ifMobile (w) {
        if(w < mobileThreshold){
           config.labelClass = 'labelSmall';
           config.tickSize = '5';
           config.labelText = "Strikes / 10k Flights"
           }

        else{
            config.tickSize = '10';
            config.labelClass = 'label';
            config.labelText = "$ of Wildlife Strikes Per 10,000 Flights"
        }
    }
    //end mobile check

    //find width of container
    var width = $graphic.width() - margin.left - margin.right;

    //set mobile variables
    ifMobile(width);
    //set height
    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;

    var chart1 = d3.select("#graphic").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.svg.axis()
        .ticks(config.tickSize)
        .tickFormat(d3.format("f"))
        .tickSize(8,8,8)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .orient("left")
        .ticks(config.tickSize)
        .tickSize(5,5,0);

    var format = d3.format("0.2f")
    //async
    d3.csv("us-strikes.csv", function(error, data) {
        //grid stuff

        var x_axis_grid = function() { return xAxis; } 

        var y_axis_grid = function() { return yAxis; }

        var x = d3.scale.linear()
                .range([0, width])
                .domain(d3.extent(data, function(d) { return d.year;})),
            y = d3.scale.linear().range([height, 0]).domain([0, d3.max(data, function(d) { return d.strikes;})]);

        var xAxis = d3.svg.axis()
            .ticks(config.tickSize)
            .tickFormat(d3.format("f"))
            .tickSize(8,8,8)
            .orient("bottom")
            .scale(x);

        var yAxis = d3.svg.axis()
            .orient("left")
            .ticks(config.tickSize)
            .tickSize(5,5,0)
            .scale(y);

        chart1.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        chart1.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 5)
                .attr("x", -5)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .attr("class", config.labelClass)
                .text(config.labelText);  

        var line = d3.svg.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.strikes); });

        //grid
        chart1.append("g")
            .attr("class", "grid")
            .call(x_axis_grid()
                .tickSize(height, 0, 0)
                .tickFormat(" "));

        chart1.append("g")
            .attr("class", "grid")
            .call(y_axis_grid()
                .tickSize(-width, 0, 0)
                .tickFormat(" "));

        //append line
        chart1.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        //mouseover effects
        var focus = chart1.append("g")
          .attr("class", "focus")
          .style("display", "none");

        focus.append("circle")
          .attr("r", 6);

        focus.append("text")
          .attr("x", 9)
          .attr("dy", ".35em");

        //mouseover overlay
        chart1.append("rect")
          .attr("class", "overlay") 
          .attr("width", width + margin.left + margin.right) //adjust these if the chart isn't capturing pointer events
          .attr("height", height + margin.top + margin.bottom)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove);

        var bisectDate = d3.bisector(function(d) { return d.year; }).left;
        
        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.year > d1.year - x0 ? d1 : d0;
            focus.attr("transform", "translate(" + x(d.year) + "," + y(d.strikes) + ")");
            focus.select("text")
                .attr("transform", "translate(" + -18 + "," + -20 + ")")
                .text(format(d.strikes))
                .attr("class", config.labelClass);
        }//end mouseover effects

    //end of d3.csv
    });


    //end mouseover effect
    if (pymChild) {
        pymChild.sendHeightToParent();
    }

}//end function render    

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {

    if (Modernizr.svg){
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    }
    else {
        pymChild = new pym.Child();
    }

})
