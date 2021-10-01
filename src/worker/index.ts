import { FrameState } from 'ol/PluggableMap'

import { cloneFrameState } from '@/utils'
import { UrlWatcher, WorkerData } from '@/types'

import OffscreenWorker from './offscreen.worker.ts'

const worker = new OffscreenWorker()
const urlWatchers: UrlWatcher[] = []

let isWorkerBusy = false
let nextFrameState: FrameState | null = null

export const enqueueRender = (frameState: FrameState): void => {
  if (isWorkerBusy) {
    nextFrameState = frameState

    return
  }

  isWorkerBusy = true

  worker.postMessage(cloneFrameState(frameState))
}

export const watchUrl = (fn: UrlWatcher): void => {
  urlWatchers.push(fn)
}

worker.addEventListener('message', ({ data }: MessageEvent<WorkerData>) => {
  if (!nextFrameState) {
    urlWatchers.forEach(fn => fn(data.url, data.extent))

    isWorkerBusy = false

    return
  }

  worker.postMessage(cloneFrameState(nextFrameState))

  nextFrameState = null
})
