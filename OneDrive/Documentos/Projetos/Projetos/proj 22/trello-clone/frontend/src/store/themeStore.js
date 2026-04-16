import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      
      toggleTheme: () => {
        const newTheme = !get().isDark
        set({ isDark: newTheme })
      },
      
      setTheme: (isDark) => set({ isDark })
    }),
    {
      name: 'theme-storage'
    }
  )
)
