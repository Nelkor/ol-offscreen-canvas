import '@/main.scss'

import { MapEvent } from 'ol'
import { FrameState } from 'ol/PluggableMap'
import ImageLayer from 'ol/layer/Image'
import BaseEvent from 'ol/events/Event'

import { enqueueRender, watchUrl } from './worker'
import { createImageSourceFactory } from './utils'
import { map } from './map'

let isMapMoving = false

map.once('postrender', () => {
  const createSource = createImageSourceFactory(map.getView().getProjection())
  const imageLayer = new ImageLayer()

  watchUrl((url, extent) => {
    // По неизвестной причине замена source происходит в два этапа:
    // 1. Выполнение функции setSource
    // 2. Некий второй этап

    // Если между этапами произошло событие movestart,
    // второй этап будет выполнен только после события moveend.
    // Не удалось найти способ отменить второй этап. Если выполнилась функция
    // setSource, второй этап также будет выполнен

    // Если на момент подготовки нового изображения
    // уже произошло новое событие movestart,
    // не меняем source, ждём следующего изображения
    if (isMapMoving) {
      return
    }

    // Однако, событие movestart может произойти не до,
    // а сразу после выполнения функции setSource.
    // Первый этап уже будет пройден, а второй будет ждать события moveend.

    // Проблема в том, что следующее событие moveend также повлечёт за собой
    // замену source, так что произойдут два события подряд: окончательное
    // применение предыдущего source и его замена новым.
    // Это вызывает мигание изображения

    // Пока что не удалось этому миганию воспрепятствовать.
    // Случается оно довольно редко
    imageLayer.setSource(createSource(url, extent))
  })

  const onMoveEnd = (event: BaseEvent) => {
    enqueueRender((event as MapEvent).frameState as FrameState)

    isMapMoving = false
  }

  map.on('movestart', () => {
    isMapMoving = true
  })

  // Единоразовая прослушка rendercomplete – костыль. Но без него не работает
  map.once('rendercomplete', onMoveEnd)
  map.on('moveend', onMoveEnd)
  map.addLayer(imageLayer)
})
