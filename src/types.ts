export interface Renderer {
  container: {
    style: unknown
    lastChild?: HTMLElement
  }
  context: OffscreenCanvasRenderingContext2D
  useContainer: (_: void, transform: string) => void
}

export type UrlWatcher = (url: string, extent: number[]) => void

export interface WorkerData {
  url: string
  extent: number[]
}

export type LayerStateArray = Record<
  number,
  {
    managed: boolean
    maxResolution: number
    maxZoom: number
    minResolution: number
    minZoom: number
    opacity: number
    sourceState: unknown
    visible: boolean
    zIndex: number
  }
>

interface ClonedFrameState {
  viewHints: number[]
  extent: number[] | null
  pixelRatio: number
  layerIndex: number
  size: number[]
  layerStatesArray: LayerStateArray
}

interface ProjectionData {
  code: string
  canWrapX: boolean
  extent: number[]
  units: unknown
}

interface Projection {
  getCode(): string
  canWrapX(): boolean
  getExtent(): number[]
  getUnits(): unknown
}

export interface ViewStateFields {
  center: number[]
  resolution: number
  rotation: number
  zoom: number
  projectionData: ProjectionData
}

interface ViewStateWithMethods extends ViewStateFields {
  projection: Projection
}

export interface ClonedFrameStateMain extends ClonedFrameState {
  viewState: ViewStateFields
}

export interface ClonedFrameStateWorker extends ClonedFrameState {
  viewState: ViewStateWithMethods
}
