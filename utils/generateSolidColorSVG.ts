export default function generateSolidColorSvg(fillColor: string): string {
  const svgSize = 2
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
            <rect width="${svgSize}" height="${svgSize}" fill="${fillColor}"/>
        </svg>`.replace(/#/g, '%23')
}
