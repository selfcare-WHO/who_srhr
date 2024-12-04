import shave from 'shave'
import { ElTooltip } from 'element-plus'
import { createVNode, render } from 'vue'

export default defineNuxtPlugin(() => {
  const useClamp = ({
    selector,
    length
  }: {
    selector: string
    length: number
  }) => {
    nextTick(() => {
      shave(selector, length)

      const elements = document.querySelectorAll(selector)

      elements.forEach(element => {
        const tooltipVNode = createVNode(
          ElTooltip,
          {
            content: element.textContent,
            placement: 'top'
          },
          { default: () => element.cloneNode(true) }
        )

        const container = document.createElement('div')
        render(tooltipVNode, container)
        element.parentNode?.replaceChild(container.firstElementChild!, element)
      })
    })
  }

  return {
    provide: {
      clamp: useClamp
    }
  }
})
