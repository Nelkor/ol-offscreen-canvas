import { FrameState } from 'ol/PluggableMap'

import { cloneFrameState } from '@/utils'
import { ImageWatcher, WorkerImage } from '@/types'

import OffscreenWorker from './offscreen.worker.ts'

const worker = new OffscreenWorker()
const imageWatchers: ImageWatcher[] = []

let isWorkerBusy = false
let nextFrameState: FrameState | null = null

export const enqueueRender = (frameState: FrameState): void => {
  // Если воркер рендерит прямо сейчас, помещаем frameState в очередь
  if (isWorkerBusy) {
    nextFrameState = frameState

    return
  }

  isWorkerBusy = true

  worker.postMessage(cloneFrameState(frameState))
}

export const watchImages = (fn: ImageWatcher): void => {
  imageWatchers.push(fn)
}

worker.addEventListener(
  'message',
  ({ data: { url, extent } }: MessageEvent<WorkerImage>) => {
    // Если на момент завершения рендеринга очередь не пуста —
    // не отдаём результат обработчикам, пусть ждут последний рендер.
    // Это помогает избежать проблем с изменением геометрии карты
    if (!nextFrameState) {
      imageWatchers.forEach(fn => fn(url, extent))

      isWorkerBusy = false

      return
    }

    worker.postMessage(cloneFrameState(nextFrameState))

    nextFrameState = null
  }
)
