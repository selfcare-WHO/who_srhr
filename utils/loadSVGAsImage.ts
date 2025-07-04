import type { Map } from 'mapbox-gl'

const pendingImages = new Set<string>()

const loadSvgAsImage = async ({
  svgDataUri,
  height,
  width
}: {
  height?: number | undefined
  svgDataUri: string
  width?: number | undefined
}) =>
  new Promise<HTMLImageElement>(resolve => {
    const image = new Image(width, height)

    image.onload = () => {
      resolve(image)
      image.remove()
    }

    image.src = svgDataUri
  })

export default async function loadSvgAsImageInMap({
  svgDataUri,
  height,
  width,
  map,
  id,
  pixelRatio
}: {
  height?: number
  id: string
  map: Map
  pixelRatio?: number
  svgDataUri: string
  width?: number
}): Promise<void> {
  if (map.hasImage(id) || pendingImages.has(id)) return

  pendingImages.add(id)

  try {
    const image = await loadSvgAsImage({ svgDataUri, height, width })

    if (!map.hasImage(id)) {
      map.addImage(id, image, { pixelRatio })
    }
  } catch (error) {
    console.error(`Failed to add image "${id}" to map:`, error)
  } finally {
    pendingImages.delete(id)
  }
}
