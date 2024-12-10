export default defineNuxtRouteMiddleware((to, from) => {
  const {
    public: { comparisonFeatureActive }
  } = useRuntimeConfig()

  if (!comparisonFeatureActive) {
    return abortNavigation()
  }
})
