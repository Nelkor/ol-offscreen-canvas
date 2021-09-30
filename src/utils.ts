import { Layer } from 'ol/layer'
import { Source } from 'ol/source'
import { FrameState } from 'ol/PluggableMap'
import { State as LayerState } from 'ol/layer/Layer'
import { State as ViewState } from 'ol/View'
import Projection from 'ol/proj/Projection'
import Static from 'ol/source/ImageStatic'

import {
  ClonedFrameStateMain,
  Renderer,
  LayerStateArray,
  ViewStateFields,
  ClonedFrameStateWorker,
} from './types'

// По неизвестной причине OL обрезает коэффициент расширения,
// так что больше 0.1 нет смысла
const EXPANSION_FACTOR = 0.1

export const getLayerRenderer = <T extends Source>(layer: Layer<T>): Renderer =>
  // Приватное поле
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  layer.renderer_

export const createOffscreenCanvas = (): OffscreenCanvas => {
  const canvas = new OffscreenCanvas(1, 1)

  // ol хочет писать в стили canvas. У OffscreenCanvas стилей нет
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  canvas.style = {}

  return canvas
}

export const createImageSourceFactory =
  (projection: Projection) =>
  (url: string, imageExtent?: number[]): Static =>
    new Static({ projection, url, imageExtent })

export const extendExtent = (extent: number[]): number[] => {
  const [x1, y1, x2, y2] = extent
  const hdx = (x2 - x1) * EXPANSION_FACTOR
  const hdy = (y2 - y1) * EXPANSION_FACTOR

  return [x1 - hdx, y1 - hdy, x2 + hdx, y2 + hdy]
}

const extendSize = (size: number[]): number[] =>
  size.map(n => n * (1 + EXPANSION_FACTOR * 2))

const copyLayerStatesArray = (
  layerStatesArray: LayerState[],
  layerIndex: number
): LayerStateArray => {
  const {
    managed,
    maxResolution,
    maxZoom,
    minResolution,
    minZoom,
    opacity,
    sourceState,
    visible,
    zIndex,
  } = layerStatesArray[layerIndex]

  return {
    [layerIndex]: {
      managed,
      maxResolution,
      maxZoom,
      minResolution,
      minZoom,
      opacity,
      sourceState,
      visible,
      zIndex,
    },
  }
}

const copyViewState = (viewState: ViewState): ViewStateFields => {
  const { center, resolution, rotation, zoom, projection } = viewState

  return {
    center,
    resolution,
    rotation,
    zoom,
    projectionData: {
      // Приватные поля

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      code: projection.code_,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      extent: projection.extent_,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      canWrapX: projection.canWrapX_,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      units: projection.units_,
    },
  }
}

export const cloneFrameState = (
  frameState: FrameState
): ClonedFrameStateMain => {
  const {
    viewHints,
    extent,
    pixelRatio,
    layerIndex,
    size,
    layerStatesArray,
    viewState,
  } = frameState

  return {
    viewHints,
    extent,
    pixelRatio,
    layerIndex,
    // Искусственно увеличиваем размеры frameState,
    // чтобы слой нарисовал немного за пределами экрана
    size: extendSize(size),
    layerStatesArray: copyLayerStatesArray(layerStatesArray, layerIndex),
    viewState: copyViewState(viewState),
  }
}

export const addMethodsToFrameState = (
  frameState: ClonedFrameStateMain
): ClonedFrameStateWorker => {
  const { viewState } = frameState
  const { projectionData } = viewState

  return {
    ...frameState,
    viewState: {
      ...viewState,
      projection: {
        getCode: () => projectionData.code,
        getExtent: () => projectionData.extent,
        getUnits: () => projectionData.units,
        canWrapX: () => projectionData.canWrapX,
      },
    },
  }
}
