import { updatePrimaryPalette, updateSurfacePalette } from '@primeuix/themes'
import { computed, onMounted, ref } from 'vue'
import { primaryColors, surfaces } from './theme'

const STORAGE_KEY = 'themeSettings'
const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

const appState = ref({
  primary: savedState.primary || 'blue',
  surface: savedState.surface || null,
  darkMode: savedState.darkMode ?? false,
})

if (appState.value.darkMode) {
  document.documentElement.classList.add('p-dark')
}

export function useLayout() {
  function setPrimary(value: string) {
    appState.value.primary = value
    saveToLocalStorage()
  }

  function setSurface(value: string) {
    appState.value.surface = value
    saveToLocalStorage()
  }

  function toggleDarkMode() {
    appState.value.darkMode = !appState.value.darkMode
    document.documentElement.classList.toggle('p-dark', appState.value.darkMode)
    saveToLocalStorage()
  }

  function updateColors(type: string, colorName: string) {
    if (type === 'primary') {
      setPrimary(colorName)
      const color = primaryColors.value.find((c) => c.name === colorName)
      updatePrimaryPalette(color?.palette)
    } else if (type === 'surface') {
      setSurface(colorName)
      const surfaceColor = surfaces.value.find((s) => s.name === colorName)
      updateSurfacePalette(surfaceColor?.palette)
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.value))
  }

  const isDarkMode = computed(() => appState.value.darkMode)
  const primary = computed(() => appState.value.primary)
  const surface = computed(() => appState.value.surface)

  onMounted(() => {
    const primaryColor = primaryColors.value.find((c) => c.name === primary.value)
    if (primaryColor) updatePrimaryPalette(primaryColor.palette)

    const surfaceColor = surfaces.value.find((s) => s.name === surface.value)
    if (surfaceColor) updateSurfacePalette(surfaceColor.palette)
  })

  return {
    primaryColors,
    surfaces,
    isDarkMode,
    primary,
    surface,
    toggleDarkMode,
    setPrimary,
    setSurface,
    updateColors,
  }
}
