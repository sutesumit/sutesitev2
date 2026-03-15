import React from 'react'
import { useTheme } from 'next-themes'
import ThemeIcon from './ThemeIcon'

const ToggleTheme = () => {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      className="flex gap-1"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <ThemeIcon theme={theme} />
    </button>
  )
}

export default ToggleTheme
