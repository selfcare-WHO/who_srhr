import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(nuxtApp => {
  // Filter out the known harmless Element-Plus slot warning.
  nuxtApp.vueApp.config.warnHandler = (msg, instance, trace) => {
    if (msg.includes('Slot "default" invoked outside of the render function'))
      return

    // fallback to default handler
    console.warn(`[Vue warn]: ${msg}\n${trace}`)
  }
})
