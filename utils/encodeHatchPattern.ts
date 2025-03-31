export default (svgContent: string) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent).replace(/'/g, '%27').replace(/"/g, '%22')}`
}
