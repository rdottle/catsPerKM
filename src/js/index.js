
import * as d3 from 'd3';
import './../css/index.scss';
// import AddIcon from '@carbon/icons/es/add/16';
import 'intersection-observer';
// import * as d3 from 'd3';
// import { queue } from "d3-queue";
// import { geoAugust } from "d3-geo-projection";
// import * as fish from 'd3-fisheye';

const topojson = require("topojson-client");
// const gb = require("./../data/OSGB_Grid_1km.geojson.json");
const gb2 = require("./../data/out.geojson.json");
const town = require("./../data/towns.geojson.json");
const scotland = require("./../data/scotlans.json");


// import map class and find parent el
import { catMap } from "./components/catMap.js";
const canvas = d3.select("#cats");

const Gatto = new catMap({
	canvas: canvas,
	gb2: gb2,
	towns: town,
	scotland: scotland
})

