import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { GeoJSON } from 'ol/format'
import { Style, Stroke, Fill } from 'ol/style'
import { FrameState } from 'ol/PluggableMap'

import {
  addMethodsToFrameState,
  createOffscreenCanvas,
  getLayerRenderer,
} from '@/utils'
import {
  ClonedFrameStateMain,
  ClonedFrameStateWorker,
  TransformMatrix,
} from '@/types'

let nextFrame: ClonedFrameStateWorker | null = null
let matrix = Array.from({ length: 6 }, () => 0) as TransformMatrix

const style = new Style({
  stroke: new Stroke({
    width: 2,
    color: '#770000',
  }),
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.4)',
  }),
})

const canvas = createOffscreenCanvas()
const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D
const source = new VectorSource({ url: '/geo.json', format: new GeoJSON() })
const layer = new VectorLayer({ style, source })

// Эта функция не только возвращает renderer, но и создаёт его
layer.getRenderer()

// getLayerRenderer возвращает renderer нужного нам типа
// (в отличие от layer.getRenderer())
const renderer = getLayerRenderer(layer)

// ol хочет писать в стили контейнера. Создадим их для него
renderer.container = { style: {} }
renderer.context = ctx

renderer.useContainer = (_: void, transform: string) => {
  matrix = transform.slice(7, -1).split(', ').map(Number) as TransformMatrix
}

self.addEventListener('message', message => {
  nextFrame = addMethodsToFrameState(message.data as ClonedFrameStateMain)
})

const draw = () => {
  requestAnimationFrame(draw)

  if (!nextFrame) {
    return
  }

  layer.render(
    nextFrame as unknown as FrameState,
    canvas as unknown as HTMLElement
  )

  nextFrame = null

  self.postMessage({ bitmap: canvas.transferToImageBitmap(), matrix })

  // OffscreenCanvas to image URL
  canvas.convertToBlob().then(blob => {
    const url = URL.createObjectURL(blob)

    console.log(url)
  })
}

requestAnimationFrame(draw)
