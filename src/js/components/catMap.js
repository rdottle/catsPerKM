import { geoAlbers } from "d3-geo";
import * as d3 from 'd3';
var _ = require('underscore');

const topojson = require("topojson-client");

class catMap { 
    constructor(opts) {
    	this.canvas = opts.canvas;
    	// this.gb = opts.gb;
    	this.gb2 = opts.gb2;
    	this.width = window.innerWidth/3;
    	this.height = window.innerHeight- 50;
    	this.towns = opts.towns;
    	this.scotland = opts.scotland;
  		this.projection = geoAlbers()
		    .rotate([0, 0.0])
		    .center([-2.0, 53.5])
		    .parallels([35.0, 65.0])
		    .translate([this.width / 2, this.height / 2])
		    .scale(3500)
		    .precision(.1)
		this.path = d3.geoPath().projection(this.projection);
  		this.path = d3.geoPath().projection(this.projection);
  		this.click = false;
  		this.imageScale = d3.scaleLog()
	  		.domain([1, 100, 500, 1000])
	  		.range([100, 20, 7, 4]);
  		this.colorScale = d3.scaleLinear()
	  		.domain(d3.extent(this.gb2.features, d => {return d.properties.catsum}))
	  		.range(['#f0f0f0', '#ff1b9c'])
		this.ready()
	}

	ready() {
		this.svg = this.canvas.append("svg").attr("width", this.width).attr("height", this.height).style("overflow", "visible");

	  this.g = this.svg.append("g")
	      .attr("class", "countries")
	      .attr("transform", "translate(0,100)");

		 this.g.selectAll("path")
		      .data(this.gb2.features)
		    .enter()
		    .append("path")
		      .attr("d", this.path)
		      // .style("stroke", "#ffffff")
		      .style("fill", d => this.colorScale(d.properties.catsum))
		      .on("mouseover", (d,i,els) => {
		      	if (!this.click)  {

		      	d3.select(els[i]).classed("highlight", true)
		      	// d3.select(els[i]).classed("up", true)

		      	 d3.select(els[i]).style("stroke", '#222222 !important')
		      	d3.select(".number-of-cats").html(this.formatNumber(d.properties.catsum) + " estimated cats")

		      	d3.selectAll("path").filter(function() {
					    	 return !this.classList.contains('highlight')
					  }).style("opacity", 0.5)

				d3.select(els[i]).raise();
		      	d3.selectAll(".card .img-cats").remove()
		      	d3.selectAll("path").classed("up", false)
		      	d3.select(els[i]).classed("up", true)

		      	let catsNum =  Math.ceil(d.properties.catsum/100);
		      		for (var i = catsNum - 1; i >= 0; i--) {
		      			console.log(catsNum, Math.round(this.imageScale(catsNum)))
		      			d3.select(".card .inner-image-wrap").append("img").attr("class", "img-cats").attr("src", "https://cataas.com/cat/gif?height="+Math.ceil(this.imageScale(catsNum)))

		      		} 
		      	} 
		      })
		     	.on("mouseout", (d,i,els) => {
		      	d3.selectAll("path").style("opacity", 1).classed("highlight", false)
		      })
		      .on("click", (d,i,els) => {
				this.click = this.click ? false : true;
		      	 d3.select(els[i]).raise();
		      	 d3.selectAll(".card .img-cats").remove();
		      	 d3.selectAll("path").classed("up", false)
		      	 d3.select(els[i]).classed("up", true)

		      	let catsNum =  Math.ceil(d.properties.catsum/100);
		      		for (var i = catsNum - 1; i >= 0; i--) {
		      			d3.select(".card .inner-image-wrap").append("img").attr("src", "https://cataas.com/cat/gif?height="+Math.ceil(this.imageScale(catsNum))).attr("class", "img-cats")
		      		} 
		      	
		      })

	this.major = ["London", "Manchester", "Bristol", "Liverpool", "Birmingham", "Cardiff"];

 	this.townsG = this.svg.append("g")
	      .attr("class", "towns")
	      .attr("transform", "translate(0,100)");

	this.townsG.selectAll("text")
		      .data(this.towns.features)
		    	.enter()
		    .append("text")
		      .attr("dy", "0")
		      .style("fill", "#4819cb")
		      .style("pointer-events", "none")
		      .attr("x", d => this.projection(d3.geoCentroid(d))[0]-10)
		      .attr("y", d => d.properties.tcity15nm == "Liverpool" || d.properties.tcity15nm == "Cardiff" ? this.projection(d3.geoCentroid(d))[1] +20 : this.projection(d3.geoCentroid(d))[1]+6)
		      .text((d) => {
		      	return this.major.includes(d.properties.tcity15nm) ? d.properties.tcity15nm : null; })

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
		      .attr("x", d => d.properties.name == "Glasgow" ? this.projection(d3.geoCentroid(d))[0]-50 : this.projection(d3.geoCentroid(d))[0])
		      .attr("y", d => this.projection(d3.geoCentroid(d))[1]+20)
		      .text((d) => {
		      	return d.properties.name }) 
	
	}

 formatNumber(num)
  {
  	num = Math.round(num * 100) / 100;
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }



}

export { catMap };
