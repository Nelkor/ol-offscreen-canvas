import '@/main.scss'

import TileLayer from 'ol/layer/Tile'
import { Stamen, Source } from 'ol/source'
import { Layer } from 'ol/layer'
import { Map as OlMap, View } from 'ol'
import { FrameState } from 'ol/PluggableMap'

import { enqueueRender, registerDrawCall } from './worker'
import { getLayerRenderer } from './utils'
import { createImageLayer, createImageSourceFactory } from './image-layer'

const background = new TileLayer({
  className: 'background',
  source: new Stamen({
    layer: 'watercolor',
  }),
})

const map = new OlMap({
  target: 'map',
  layers: [background],
  view: new View({
    center: [41e5, 7506e3],
    zoom: 11,
  }),
})

map.once('postrender', () => {
  const customCanvas = (
    getLayerRenderer(background).container.lastChild as HTMLElement
  ).cloneNode() as HTMLCanvasElement

  const ctx = customCanvas.getContext('2d') as CanvasRenderingContext2D
  const container = document.createElement('div')

  container.className = 'custom-layer'
  container.style.position = 'absolute'
  container.style.width = '100%'
  container.style.height = '100%'

  registerDrawCall((image, matrix) => {
    customCanvas.width = image.width
    customCanvas.height = image.height

    ctx.save()
    ctx.transform(...matrix)
    ctx.drawImage(image, 0, 0)
    ctx.restore()
  })

  const customLayer = new Layer({
    className: 'custom-layer',
    render(frameState: FrameState) {
      enqueueRender(frameState)

      return container
    },
    source: new Source({}),
  })

  container.appendChild(customCanvas)

  map.addLayer(customLayer)

  // image layer
  const createSource = createImageSourceFactory(map.getView().getProjection())

  const imageLayer = createImageLayer(
    createSource(map.getView().calculateExtent())
  )

  const drawImage = () => {
    imageLayer.setSource(createSource(map.getView().calculateExtent()))
  }

  map.addLayer(imageLayer)

  map.on('moveend', drawImage)
})
