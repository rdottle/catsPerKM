
// lessen the load of the d3 library by only importing ones i am including and individually add them to the package.json
import{ d3 } from './../d3.js';

class catMap {
  constructor(opts) {

  	// parent el
  	this.canvas = opts.canvas;
  	// map data
  	this.greatBritainShape = opts.greatBritainShape;
  	// town and city data for gb and scotland comes seperately
  	this.mobile = window.innerWidth < 1200 ? true : false;
  	this.towns = opts.towns;
  	this.scotland = opts.scotland;
  	// towns i want to show on the map for now, might add more in the future?
		this.major = ["London", "Manchester", "Bristol", "Liverpool", "Birmingham", "Cardiff"];

    this.catAmount;

  	// get width of page, will not be resized automatically
  	this.width = this.mobile ? window.innerWidth : window.innerWidth/2.5;
  	this.height = window.innerHeight - 90;

  	// variable click used to allow deactivation of hover to solve an unpleasant user experience with the hover state
		this.click = !this.mobile ? false : true;

		// color and image size scales init
		this.initScales();

  	this.initProjection();

    // draw this map!
		this.draw();

	}

	initScales() {

		// this log scale determines the size of the image displayed, and needs some work
		this.imageScale = d3.scaleLog()
		  .base(10)
  		.domain([1, 10, 20, 100, 1000])
  		.range([350, 75, 65, 30, 7]);

  	// color scale for the sum of the cats per 25km square
		this.colorScale = d3.scaleLinear()
  		.domain([0,0.00001,75183])
  		.range(['#c1c1c1','#fec770', '#ff1b9c']);

	}

	initProjection () {

		// init the projection with geoAlbers and set the scale, static scale since this isn't a zoomable map
		this.projection = d3.geoAlbers()
	    .rotate([0, 0.0])
	    .center([-2.0, 53.5])
	    .parallels([35.0, 65.0])
	    .translate([this.width / 2, this.height / 2])
	    .scale(3500)
	    .precision(.1);
		this.path = d3.geoPath().projection(this.projection);

	}

	draw() {

		// draw svg
		this.svg = this.canvas.append("svg").attr("width", this.width).attr("height", this.height);

		// group for grid of squares
	  this.g = this.svg.append("g")
	      .attr("class", "grid-map")
	      .attr("transform", this.mobile ? "translate(30,100)" : "translate(0,100)");

	  // append paths and adding data, draw paths using projection, color using color scale
		this.g.selectAll("path")
		  .data(this.greatBritainShape.features)
		.enter()
		  .append("path")
		  .attr("d", this.path)
		  .attr("class", d => d.properties.PLAN_NO)
		  .style("fill", d => this.colorScale(d.properties.catsum))
		  .on("mouseover", (d,i,els) => {
		  	 	this.hoverOver(d,i,els);
          this.gifMagnify();
		    })
		  .on("mouseout", (d,i,els) => {
		    	d3.selectAll("path").style("opacity", 1).classed("highlight", false);
		    })
		  .on("click", (d,i,els) => {
		     	// on click, freeze hover state, until click again to make it easier to see cat gif chart
					!this.mobile ? (this.click = this.click ? false : true) : null;
					this.interactionsWithGrid(d,i,els);
		     	this.calcImage(d.properties.catsum);
          this.numberSentence(d.properties.catsum);
          this.gifMagnify();

		  });


 		this.engWalesG = this.svg.append("g")
	    .attr("class", "towns")
	    .attr("transform", "translate(0,100)");

  	this.engWalesG.selectAll("text")
			// only include label data for those I chose in this.major
		  .data(this.towns.features)
		.enter()
		  .append("text")
		    .attr("dy", "0")
		    .style("fill", "#4819cb")
		   	.style("font-size", "12px")
		    .style("pointer-events", "none")
		    .attr("x", d => d.properties.tcity15nm == "Liverpool" ? this.projection(d3.geoCentroid(d))[0] - 10 : this.projection(d3.geoCentroid(d))[0])
		    // translate a few of the labels specifically because they overlap with others on the map, needs a re-factor
		    .attr("y", d => d.properties.tcity15nm == "Liverpool"  || d.properties.tcity15nm == "Cardiff" ? this.projection(d3.geoCentroid(d))[1] + 24 : this.projection(d3.geoCentroid(d))[1]+ 6)
		    .text(d => d.properties.tcity15nm);

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
		  .style("font-size", "12px")
		  // translate a few of the labels specifically because they overlap with others on the map, needs a re-factor
		  .attr("x", d => d.properties.name == "Glasgow" ? this.projection(d3.geoCentroid(d))[0]-60 : this.projection(d3.geoCentroid(d))[0])
		  .attr("y", d => this.projection(d3.geoCentroid(d))[1]+20)
		  .text(d => d.properties.name);

	}

	hoverOver (d, i, els) {

  	// if someone has clicked do not initiate hover, so they can pause to see cat gif if they want
  	// hover is reactivated on another click
  	if (!this.click)  {

	  	// select hovered grid, and add highlight class to it
	  	d3.select(els[i]).classed("highlight", true)

	  	// update text to display the actual number of cats, formatted to be human readable
	  	this.numberSentence(d.properties.catsum);

	  	// quick and dirty fix to make all except highlighted square transparent, needs a re-factor
	  	d3.selectAll("path").filter(function() {
		    return !this.classList.contains('highlight')
		  }).style("opacity", 0.5)

			this.interactionsWithGrid(d,i,els);

	  	// calculate those cat gifs!
	  	this.calcImage(d.properties.catsum);

  	}
	}

	numberSentence (catSum) {
    let sentence = this.formatNumber(catSum) == 1 ? "About " + this.formatNumber(catSum) + " cat in this area" :
      this.formatNumber(catSum) == 0 ? "0 cats!" :
      "About " + this.formatNumber(catSum) + " cats in this area";
		d3.select(".number-of-cats").html(sentence)

  }

	calcImage (catSum) {

		// total cats in grid square divided by 100 rounded up
  	let catsTotal =  Math.ceil(catSum/100);
  	// for this cat total, which is the sum divided by 100 and rounded up to the nearest 100,
  	// add an image, building the gif chart
  	// and scale the size of that image using the d3 image scale defined earlier
  	for (var i = catsTotal - 1; i >= 0; i--) {
  		d3.select(".card .inner-image-wrap")
  			.append("img")
  			.attr("class", "img-cats")
  			.attr("src", Math.ceil(this.imageScale(catsTotal)) > 100 ? "https://cataas.com/cat/gif?height=" + Math.ceil(this.imageScale(catsTotal)) : "https://cataas.com/cat/gif?height=" + Math.ceil(this.imageScale(catsTotal)) * 3)
        .style("height", Math.ceil(this.imageScale(catsTotal)) + "px");
  	}

    this.catAmount = Math.ceil(this.imageScale(catsTotal));
	}

	interactionsWithGrid (d, i, els) {

		// make sure hovered item is at the top of the svg so it doesn't overlap
		d3.select(els[i]).raise();
		// remove all images from previous hover or click state
	  d3.selectAll(".card .img-cats").remove();
	  // make sure to remove hovered class from previous square
	  d3.selectAll("path").classed("up", false);
	  // add hover class to this current el
	  d3.select(els[i]).classed("up", true);

	}

 	formatNumber (num) {

 		// format number to show on the page without too many decimals etc.
  	num = num < 1 && num > 0 ? 1 : Math.round(num);
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");

	}

	onFirstLoad (example) {

		let exampleData = this.greatBritainShape.features.filter(d => d.properties.PLAN_NO == example);
		// make sure hovered item is at the top of the svg so it doesn't overlap
		d3.select("." + example).raise();
		// remove all images from previous hover or click state
	  d3.selectAll(".card .img-cats").remove();
	  // make sure to remove hovered class from previous square
	  d3.selectAll("path").classed("up", false);
	  // add hover class to this current el
	  d3.select("." + example).classed("up", true);

	  this.calcImage(exampleData[0].properties.catsum);
	  this.numberSentence(exampleData[0].properties.catsum);
    this.gifMagnify();
	}

  gifMagnify() {

    if(!this.mobile) {

        d3.select(".microscope img").remove();
        if (this.catAmount < 150) {
          d3.select(".microscope").style("opacity", 0).style("visibility", "hidden")
          d3.select(".microscope").append("img").classed("hover-image", true).style("position", "absolute")
          .attr("src", "https://cataas.com/cat/gif?height=" + this.catAmount*3)
          .style("height", "250px");

          d3.selectAll(".img-cats").on("mouseenter", () => {
            d3.select(".microscope").style("visibility", "visible").transition().delay(200).style("opacity", 1)
            d3.select(".microscope img").transition().duration(150).ease(d3.easeLinear).style("top", d3.event.pageY - 100 + "px").style("left", d3.event.pageX + "px").style("z-index", "10000");
          })
          d3.selectAll(".img-cats").on("mouseout", () => {
            d3.select(".microscope").style("visibility", "visible").transition().delay(200).duration(200).style("opacity", 0)
          })
        }
    }
  }
}

export { catMap };
