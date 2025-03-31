import type { Map } from 'mapbox-gl'

const loadSvgAsImage = async ({
  svgDataUri,
  height,
  width
}: {
  height?: number | undefined
  svgDataUri: string
  width?: number | undefined
}) => {
  return new Promise<HTMLImageElement>(resolve => {
    const image = new Image(width, height)

    image.onload = () => {
      resolve(image)
      image.remove()
    }

    image.src = svgDataUri
  })
}

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
  if (map.hasImage(id)) return

  try {
    const image = await loadSvgAsImage({ svgDataUri, height, width })
    map.addImage(id, image, { pixelRatio })
  } catch (error) {
    console.error(`Failed to add image "${id}" to map:`, error)
  }
}
