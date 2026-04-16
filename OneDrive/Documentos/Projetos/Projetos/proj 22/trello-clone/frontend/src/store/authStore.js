import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data
          set({ user, token, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          return true
        } catch (error) {
          set({ 
            error: error.response?.data?.error || 'Erro ao fazer login', 
            isLoading: false 
          })
          return false
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', { name, email, password })
          const { user, token } = response.data
          set({ user, token, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          return true
        } catch (error) {
          set({ 
            error: error.response?.data?.error || 'Erro ao criar conta', 
            isLoading: false 
          })
          return false
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null })
        delete api.defaults.headers.common['Authorization']
      },

      checkAuth: async () => {
        const token = get().token
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          try {
            const response = await api.get('/users/me')
            set({ user: response.data })
          } catch (error) {
            // Token inválido ou erro de conexão, limpar
            set({ user: null, token: null })
            delete api.defaults.headers.common['Authorization']
          }
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
)
