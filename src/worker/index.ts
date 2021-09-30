import { FrameState } from 'ol/PluggableMap'

import { cloneFrameState } from '@/utils'

import OffscreenWorker from './offscreen.worker.ts'

const worker = new OffscreenWorker()

export const getImageURL = (frameState: FrameState): Promise<string> =>
  new Promise(resolve => {
    const onMessage = ({ data }: MessageEvent<string>) => {
      worker.removeEventListener('message', onMessage)

      resolve(data)
    }

    worker.addEventListener('message', onMessage)
    worker.postMessage(cloneFrameState(frameState))
  })
