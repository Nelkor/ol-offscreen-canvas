import { Layer } from 'ol/layer'
import { Source } from 'ol/source'
import { FrameState } from 'ol/PluggableMap'
import { State as LayerState } from 'ol/layer/Layer'
import { State as ViewState } from 'ol/View'

import {
  ClonedFrameStateMain,
  Renderer,
  LayerStateArray,
  ViewStateFields,
  ClonedFrameStateWorker,
} from './types'

export const getLayerRenderer = <T extends Source>(layer: Layer<T>): Renderer =>
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
      // PRIVATE FIELDS

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
    size,
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
