import { FrameState } from 'ol/PluggableMap'

import { cloneFrameState } from '@/utils'
import { DrawCall, DrawImageData } from '@/types'

import OffscreenWorker from './offscreen.worker.ts'

const worker = new OffscreenWorker()
const drawCalls: DrawCall[] = []

export const enqueueRender = (frameState: FrameState): void => {
  worker.postMessage(cloneFrameState(frameState))
}

export const registerDrawCall = (drawCall: DrawCall): void => {
  drawCalls.push(drawCall)
}

worker.addEventListener('message', message => {
  const { bitmap, matrix } = message.data as DrawImageData

  drawCalls.forEach(drawCall => drawCall(bitmap, matrix))
})
