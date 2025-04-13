export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark')
  const newTheme = isDark ? 'light' : 'dark'

  document.documentElement.classList.toggle('dark', !isDark)
  localStorage.setItem('theme', newTheme)
}
