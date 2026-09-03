export default defineNuxtRouteMiddleware(() => {
  const {
    public: { mapViewActive }
  } = useRuntimeConfig()

  if (!mapViewActive) {
    return navigateTo('/country-comparison/table-view')
  }
})
