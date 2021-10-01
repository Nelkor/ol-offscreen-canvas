import TileLayer from 'ol/layer/Tile'
import { Stamen } from 'ol/source'
import { Map as OlMap, View } from 'ol'

const background = new TileLayer({
  className: 'background',
  source: new Stamen({
    layer: 'watercolor',
  }),
})

export const map = new OlMap({
  target: 'map',
  layers: [background],
  view: new View({
    center: [41e5, 7506e3],
    zoom: 11,
  }),
})
