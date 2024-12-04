import shave from 'shave'
import { ElTooltip } from 'element-plus'
import { createVNode, render } from 'vue'

export const useClamp = ({
  id,
  length = 60
}: {
  id: string
  length?: number
}) => {
  nextTick(() => {
    const element = document.getElementById(id)
    if (!element) return

    const originalText = element.textContent

    shave(element, length)

    if (originalText === element.innerHTML) return

    const tooltipVNode = createVNode(
      ElTooltip,
      {
        content: originalText,
        placement: 'top',
        popperClass: 'max-w-[250px]'
      },
      {
        default: () =>
          createVNode('span', {
            innerHTML: element.innerHTML,
            class: ['cursor-pointer', element.className]
          })
      }
    )

    const container = document.createElement('div')
    render(tooltipVNode, container)

    element.parentNode?.replaceChild(container.firstElementChild!, element)
  })
}
