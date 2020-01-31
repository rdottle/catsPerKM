
import * as d3 from 'd3';
import './../css/index.scss';
import 'intersection-observer';


const topojson = require("topojson-client");
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

