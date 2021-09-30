import '@/main.scss'

import TileLayer from 'ol/layer/Tile'
import { Stamen } from 'ol/source'
import { Map as OlMap, MapEvent, View } from 'ol'
import { FrameState } from 'ol/PluggableMap'
import ImageLayer from 'ol/layer/Image'
import BaseEvent from 'ol/events/Event'

import { getImageURL } from './worker'
import { createImageSourceFactory, extendExtent } from './utils'

const background = new TileLayer({
  className: 'background',
  source: new Stamen({
    layer: 'watercolor',
  }),
})

const view = new View({
  center: [41e5, 7506e3],
  zoom: 11,
})

const map = new OlMap({
  target: 'map',
  layers: [background],
  view,
})

map.once('postrender', () => {
  const createSource = createImageSourceFactory(view.getProjection())
  const imageLayer = new ImageLayer()

  const onMoveEnd = (event: BaseEvent) => {
    // Искусственно увеличиваем extent,
    // чтобы слой нарисовал немного за пределами экрана
    const extent = extendExtent(view.calculateExtent())

    getImageURL((event as MapEvent).frameState as FrameState).then(url => {
      imageLayer.setSource(createSource(url, extent))
    })
  }

  // Единоразовая прослушка rendercomplete – костыль. Но без него не работает
  map.once('rendercomplete', onMoveEnd)
  map.on('moveend', onMoveEnd)
  map.addLayer(imageLayer)
})
