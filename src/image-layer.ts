import ImageLayer from 'ol/layer/Image'
import Projection from 'ol/proj/Projection'
import Static from 'ol/source/ImageStatic'

export const createImageLayer = (source: Static): ImageLayer<Static> =>
  new ImageLayer({ source })

export const createImageSourceFactory =
  (projection: Projection) =>
  (imageExtent?: number[]): Static =>
    new Static({
      projection,
      imageExtent,
      url: 'https://imgs.xkcd.com/comics/online_communities.png',
    })
