declare module '*.worker.ts' {
  class WebpackWorker extends Worker {
    constructor()
  }

  export = WebpackWorker
}

declare module '*.svg' {
  const text: string

  export default text
}
