import { select, selectAll, event } from 'd3-selection';
import { json } from 'd3-fetch';
import { scaleLog, scaleLinear } from 'd3-scale';
import { max, min, extent } from 'd3-array';
import { transition } from 'd3-transition';
import { easeLinear, easeBounce } from 'd3-ease';
import { geoPath, geoTransform, geoAlbers, geoCentroid } from 'd3-geo';

const d3 = {

  json,
  geoPath,
  geoTransform,
  select,
  selectAll,
  geoAlbers,
  geoCentroid,
  scaleLog,
  max,
  min,
  extent,
  scaleLinear,
  easeLinear,
  transition,
  easeBounce,
  get event() { return event; },
};

export { d3 };
