import { geoAlbers } from "d3-geo";

// lessen the load of the d3 library by only importing ones i am including and individually add them to the package.json
import * as d3 from 'd3';
const topojson = require("topojson-client");

class catMap { 
  constructor(opts) {
  	
  	// parent el
  	this.canvas = opts.canvas;
  	// map data
  	this.greatBritainShape = opts.greatBritainShape;
  	// town and city data for gb and scotland comes seperately 
  	this.towns = opts.towns;
  	this.scotland = opts.scotland;
  	// towns i want to show on the map for now, might add more in the future?
		this.major = ["London", "Manchester", "Bristol", "Liverpool", "Birmingham", "Cardiff"];

  	// get width of page, will not be resized automatically
  	this.width = window.innerWidth/3;
  	this.height = window.innerHeight- 50;

  	// variable click used to allow deactivation of hover to solve an unpleasant user experience with the hover state
		this.click = false;

		// color and image size scales init
		this.initScales();
  
  	this.initProjection();
  	
  	// draw this map!
		this.draw();
	}

	initScales() {

		// this log scale determines the size of the image displayed, and needs some work
		this.imageScale = d3.scaleLog()
  		.domain([1, 5, 100, 500, 1000])
  		.range([350, 75, 20, 7, 4]);

  	// color scale for the sum of the cats per 25km square
		this.colorScale = d3.scaleLinear()
  		.domain(d3.extent(this.greatBritainShape.features, d => {return d.properties.catsum}))
  		.range(['#f0f0f0', '#ff1b9c'])

	}

	initProjection () {

		// init the projection with geoAlbers and set the scale, static scale since this isn't a zoomable map
		this.projection = geoAlbers()
	    .rotate([0, 0.0])
	    .center([-2.0, 53.5])
	    .parallels([35.0, 65.0])
	    .translate([this.width / 2, this.height / 2])
	    .scale(3500)
	    .precision(.1)
		this.path = d3.geoPath().projection(this.projection);

	}

	draw() {

		// draw svg
		this.svg = this.canvas.append("svg").attr("width", this.width).attr("height", this.height);

		// group for grid of squares
	  this.g = this.svg.append("g")
	      .attr("class", "grid-map")
	      .attr("transform", "translate(0,100)");

	  // append paths and adding data, draw paths using projection, color using color scale
		 this.g.selectAll("path")
		    .data(this.greatBritainShape.features)
		  .enter()
		    .append("path")
		    .attr("d", this.path)
		    .style("fill", d => this.colorScale(d.properties.catsum))
		    .on("mouseover", (d,i,els) => {

		     	this.hoverOver(d,i,els); 

		    })
		    .on("mouseout", (d,i,els) => {

		    	d3.selectAll("path").style("opacity", 1).classed("highlight", false);

		    })
		    .on("click", (d,i,els) => {

		     	// on click, freeze hover state, until click again to make it easier to see cat gif chart
					this.click = this.click ? false : true;
					this.interactionsWithGrid(d,i,els);
		     	this.calcImage(d.properties.catsum);
		      
		    })


 		this.engWalesG = this.svg.append("g")
	    .attr("class", "towns")
	    .attr("transform", "translate(0,100)");

		this.engWalesG.selectAll("text")
			// only include label data for those I chose in this.major
		  .data(this.towns.features.filter((d)=> {return this.major.includes(d.properties.tcity15nm) ? d : null }))
		.enter()
		  .append("text")
		    .attr("dy", "0")
		    .style("fill", "#4819cb")
		    .style("pointer-events", "none")
		    .attr("x", d => this.projection(d3.geoCentroid(d))[0]-10)
		    // translate a few of the labels specifically because they overlap with others on the map, needs a re-factor
		    .attr("y", d => d.properties.tcity15nm == "Liverpool" || d.properties.tcity15nm == "Cardiff" ? this.projection(d3.geoCentroid(d))[1] + 20 : this.projection(d3.geoCentroid(d))[1]+6)
		    .text(d => d.properties.tcity15nm)

		// add a group for the scotland labels
		this.scotlandG = this.svg.append("g")
	    .attr("class", "scot")
	    .attr("transform", "translate(0,100)");

		this.scotlandG.selectAll("text")
		  .data(this.scotland.features)
		.enter()
			.append("text")
		  .attr("dy", "0")
		  .style("pointer-events", "none")
		  .style("fill", "#4819cb")
		  // translate a few of the labels specifically because they overlap with others on the map, needs a re-factor
		  .attr("x", d => d.properties.name == "Glasgow" ? this.projection(d3.geoCentroid(d))[0]-50 : this.projection(d3.geoCentroid(d))[0])
		  .attr("y", d => this.projection(d3.geoCentroid(d))[1]+20)
		  .text(d => d.properties.name) 
	
	}

	hoverOver(d,i,els) {

  	// if someone has clicked do not initiate hover, so they can pause to see cat gif if they want
  	// hover is reactivated on another click
  	if (!this.click)  {

	  	// select hovered grid, and add highlight class to it
	  	d3.select(els[i]).classed("highlight", true)

	  	// update text to display the actual number of cats, formatted to be human readable
	  	d3.select(".number-of-cats").html(this.formatNumber(d.properties.catsum) + " estimated cats")

	  	// quick and dirty fix to make all except highlighted square transparent, needs a re-factor
	  	d3.selectAll("path").filter(function() {
		    	 return !this.classList.contains('highlight')
		  }).style("opacity", 0.5)
			
			this.interactionsWithGrid(d,i,els);

	  	// calculate those cat gifs!
	  	this.calcImage(d.properties.catsum);

  	}
	}

	calcImage(catSum) {

		// total cats in grid square divided by 100 rounded up
  	let catsTotal =  Math.ceil(catSum/100);
  	
  	// for this cat total, which is the sum divided by 100 and rounded up to the nearest 100, 
  	// add an image, building the gif chart
  	// and scale the size of that image using the d3 image scale defined earlier
  	for (var i = catsTotal - 1; i >= 0; i--) {
  		d3.select(".card .inner-image-wrap")
  			.append("img")
  			.attr("class", "img-cats")
  			.attr("src", "https://cataas.com/cat/gif?height="+Math.ceil(this.imageScale(catsTotal)));

  	} 
	}

	interactionsWithGrid(d,i,els) {

		// make sure hovered item is at the top of the svg so it doesn't overlap
		d3.select(els[i]).raise();
		// remove all images from previous hover or click state
	  d3.selectAll(".card .img-cats").remove();
	  // make sure to remove hovered class from previous square
	  d3.selectAll("path").classed("up", false);
	  // add hover class to this current el
	  d3.select(els[i]).classed("up", true);

	}

 	formatNumber(num) {

 		// format number to show on the page without too many decimals etc. 
  	num = Math.round(num * 100) / 100;
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");

	}

}

export { catMap };
