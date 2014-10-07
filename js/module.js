//namespace
d3.edge = {};
var x = function(){},
	y = function(){};

//linechart under the module namespace
d3.edge.lineChart = function module() {
	//define some globals
	var mobileThreshold = 350,
		aspect_width = 16,
		aspect_height = 9,
		pymChild = null,
		tickSize = 13,
		labelClass = "label",
		yAxisLabel = "This is the Y Axis",
		strokeWidth = 5,
		strokeColor = "#28556F"; //dark blue

	var margin = {
		top: 30,
		right: 30,
		bottom: 30,
		left: 50
	};

	var tooltip = {
		value: "strikes",
		string: "strikes"
	};

	//everything below this is private
	function exports(_selection) {
		_selection.each(function(_data) {
	    	//find width of container
	    	//var $graphic = $(_selection);
		    var width = $(this).width() - margin.left - margin.right;

		    //set height
		    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;
		   	//mobile checks

			function ifMobile(w) {
				if(w < mobileThreshold){
				   labelClass = 'labelSmall';
				   tickSize = Math.ceil(tickSize/2);
				   }
				else {
				    tickSize = tickSize;
				    labelClass = labelClass;
				}}

		    //set mobile variables
		    ifMobile(width);

		    //create svg, transform it and group it
		    var svg = d3.select(this)
		    	.append("svg")
		        .attr("width", width + margin.left + margin.right)
		        .attr("height", height + margin.top + margin.bottom).append("g")
		            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		    var format = d3.format("0.2f");

		    //async was here

	        var x_axis_grid = function() { return xAxis; }; 

	        var y_axis_grid = function() { return yAxis; };

			var x = d3.scale.linear()
					.range([0, width])
					.domain(d3.extent(_data, xAccess),
				y = d3.scale.linear().range([height, 0]).domain([0, d3.max(_data, yAccess)]));

	        var xAxis = d3.svg.axis()
	            .ticks(tickSize)
	            .tickFormat(d3.format("f"))
	            .tickSize(8,8,0)
	            .orient("bottom")
	            .scale(x);

	        var yAxis = d3.svg.axis()
	            .orient("left")
	            .ticks(tickSize)
	            .tickSize(5,5,0)
	            .scale(y);

	        svg.append("g")
	            .attr("class", "x axis")
	            .attr("transform", "translate(0," + height + ")")
	            .call(xAxis);

	        svg.append("g")
	            .attr("class", "y axis")
	            .call(yAxis)
	            .append("text")
	                .attr("transform", "rotate(-90)")
	                .attr("y", -margin.left + 10)
	                .attr("x", -10)
	                .attr("dy", "0.71em")
	                .style("text-anchor", "end")
	                .attr("class", labelClass)
	                .text(yAxisLabel);  

	        var line = d3.svg.line()
	            .x(function(d) { return x(d[pathX]); })
	            .y(function(d) { return y(d[pathY]); });

	        //grid
	        svg.append("g")
	            .attr("class", "grid")
	            .call(x_axis_grid()
	                .tickSize(height, 0, 0)
	                .tickFormat(" "));

	        svg.append("g")
	            .attr("class", "grid")
	            .call(y_axis_grid()
	                .tickSize(-width, 0, 0)
	                .tickFormat(" "));
	        //end grid

	        //append line
	        svg.append("path")
	            .datum(_data)
	            .attr("class", "line")
	            .attr("d", line)
	            .style("stroke-width", strokeWidth)
	            .style("stroke", strokeColor)
	            ;

	        //mouseover effects
	        var focus = svg.append("g")
	          .attr("class", "focus")
	          .style("display", "none");

	        focus.append("circle")
	          .attr("r", 6)
	          .style("stroke", strokeColor);

	        focus.append("text")
	          .attr("x", 9)
	          .attr("dy", ".35em");

		    var div = d3.select("#graphic").append("div")
		    	.attr("class", "tooltip")
		    	.style("opacity", 0);

	        //mouseover overlay
	        svg.append("rect")
	          .attr("class", "overlay")
	          .attr("width", width + margin.left + margin.right) //adjust these if the chart isn't capturing pointer events
	          .attr("height", height + margin.top)
	          .on("mouseover", function() { 
	          		focus.style("display", null);
	          		})
	          .on("mouseout",
	          	function(d) { 
	          		focus.style("display", "none"); 
	          		div.transition()
	          			.duration(500)
	          			.style("opacity", 0);
	          	})
	          .on("mousemove", mousemove);

	        var bisectDate = d3.bisector(function(d) { return d[pathX]; }).left;
	        
	        function mousemove() {
	            var x0 = x.invert(d3.mouse(this)[0]),
	                i = bisectDate(_data, x0, 1),
	                d0 = _data[i - 1],
	                d1 = _data[i],
	                d = x0 - d0[pathX] > d1[pathY] - x0 ? d1 : d0;

	            focus.attr("transform", "translate(" + x(d[pathX]) + "," + y(d[pathY]) + ")");
	            //show div
	           	d3.select(".tooltip").transition()
	           		.duration(200)
	           		.style("opacity", .9);

	           	d3.select(".tooltip")
	           		.html(format(d[pathY]) + " strikes")
	           		.style("left", x(d[pathX]) + margin.left + "px")
	           		.style("top", y(d[pathY]) + $("#graphic").position().top + "px");

	           	d3.select(".tooltip")
	           		.html(format(d[tooltip.value]) + " " + tooltip.string);

	        }//end mouseover effects
		});

	}//end of exports

	exports.xAccess = function (_x) {
		//takes a function like function(d {return d.value; }
		if(!arguments.length) return xAccess;
		xAccess = _x;
		return this;
	};

	exports.yAccess = function(_x) {
		//takes a function like function(d {return d.value; }
		if(!arguments.length) return yAccess;
		yAccess = _x;
		return this;
	};

	exports.pathX = function(_x) {
		//give a csv header--the "value" in d.value
		if(!arguments.length) return pathX;
		pathX = _x;
		return this;
	}

	exports.pathY = function(_x) {
		//give a csv header--the "value" in d.value
		if(!arguments.length) return pathY;
		pathY = _x;
		return this;
	}

	exports.tooltip = function(_x, _y) {
		//takes the value passed to the tooltip and the string to follow it
		if (!arguments.length) return tooltip;
		tooltip.value = _x,
		tooltip.string = _y;
		return this;
	}

	exports.strokeWidth = function (_x) {
		//takes a number
		if (!arguments.length) return strokeWidth;
		strokeWidth = _x;
		return this;
	}

	exports.strokeColor = function(_x) {
		//takes a css color or hex
		if (!arguments.length) return strokeColor;
		strokeColor = _x;
		return this;
	}

	return exports;
}; //end

//useage
var myLineChart = d3.edge.lineChart()
	.xAccess(function(d) {return d.year;})
	.yAccess(function(d) {return +d.strikes;})
	.pathX("year")
	.pathY("strikes");

d3.csv("us-strikes.csv", function(data) {
	console.log(data);
	d3.select("#graphic")
		.datum(data)
		.call(myLineChart);
});

