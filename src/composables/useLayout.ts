import { updatePrimaryPalette, updateSurfacePalette } from '@primeuix/themes'
import { computed, ref } from 'vue'
import { primaryColors, surfaces } from './theme'


const STORAGE_KEY = 'themeSettings'
const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

const appState = ref({
  primary: savedState.primary || 'emerald',
  surface: savedState.surface || null,
  darkMode: savedState.darkMode ?? false,
})

// Aplica el modo oscuro si estaba activado
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
