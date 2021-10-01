# ol-offscreen-canvas

Пример растеризации векторного слоя библиотеки OpenLayers в воркере.

В основном потоке выполняется карта с TileLayer "Stamen watercolor", а также
ImageLayer, источник которого обновляется по сигналу воркера. Воркер выполняет
VectorLayer, который рендерит на OffscreenCanvas, оборачивает в ObjectURL
и отправляет основному потоку.

## Команды

|                        |                       |
|------------------------|:----------------------|
| Install dependencies   | `npm i`               |
| Run tests              | `npm run test`        |
| Check types            | `npm run ts`          |
| Run dev-server         | `npm run serve`       |
| Build                  | `npm run build`       |
| Lint                   | `npm run lint`        |
| Format                 | `npm run format`      |
|                        |                       |
