export default (
  name = '--el-bg-color-none',
  element = document.documentElement
) => {
  if (name.startsWith('var(') && name.endsWith(')')) {
    name = name.substring(4, name.length - 1)
  }

  const varName = name.startsWith('--') ? name : `--${name}`
  return getComputedStyle(element).getPropertyValue(varName).trim()
}
