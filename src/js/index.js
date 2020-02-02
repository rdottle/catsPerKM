
import './../css/index.scss';
import 'intersection-observer';
import{ d3 } from './d3.js';

const gb = require("./../data/out.geojson.json");
const town = require("./../data/towns.geojson.json");
const scotland = require("./../data/scotlans.json");

// import map class and find parent el
import { catMap } from "./components/catMap.js";

// select the parent el
const canvas = d3.select("#cats");

// pass the opts to catMap that it requires, including the data and parent el
const Gatto = new catMap({
	canvas: canvas,
	greatBritainShape: gb,
	towns: town,
	scotland: scotland
})

// on first load select a grid square to begin with
Gatto.onFirstLoad("NH2499");

// source click
d3.select(".source").on("click", sourceClick);

function sourceClick() {
    if (d3.select(".links").classed("hide")) {
    d3.select(".hide").classed("hide", false).classed("show", true);
    d3.select(".arrow").transition().duration(300).ease(d3.easeLinear).style("transform", "rotate(0deg)")
  }
  else {
    d3.select(".links").classed("hide", true).classed("show", false);
    d3.select(".arrow").transition().duration(300).ease(d3.easeLinear).style("transform", "rotate(-90deg)")
  }
};
