'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    try {
      // Enable compact UI by default to reduce bulky spacing
      document.documentElement.classList.add('compact')
    } catch (e) {
      // ignore (server-side render)
    }
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
