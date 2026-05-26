const STORAGE_KEY = 'darkMode'

export function isDarkModeOn() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

// Apply stored preference to <html> — call once before first render to avoid flash
export function applyDarkMode() {
  document.documentElement.classList.toggle('dark', isDarkModeOn())
}

// Persist and immediately apply a new preference
export function setDarkMode(enabled) {
  localStorage.setItem(STORAGE_KEY, String(enabled))
  document.documentElement.classList.toggle('dark', enabled)
}
