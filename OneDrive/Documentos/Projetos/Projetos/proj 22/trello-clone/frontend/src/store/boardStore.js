import { create } from 'zustand'
import api from '../lib/axios'

export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,

  fetchBoards: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/boards')
      set({ boards: response.data, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Erro ao carregar boards', 
        isLoading: false 
      })
    }
  },

  fetchBoard: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/boards/${id}`)
      set({ currentBoard: response.data, isLoading: false })
      return response.data
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Erro ao carregar board', 
        isLoading: false 
      })
      return null
    }
  },

  createBoard: async (data) => {
    try {
      const response = await api.post('/boards', data)
      set({ boards: [response.data, ...get().boards] })
      return response.data
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao criar board'
    }
  },

  updateBoard: async (id, data) => {
    try {
      await api.put(`/boards/${id}`, data)
      set({
        boards: get().boards.map(b => b.id === id ? { ...b, ...data } : b),
        currentBoard: get().currentBoard?.id === id 
          ? { ...get().currentBoard, ...data } 
          : get().currentBoard
      })
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao atualizar board'
    }
  },

  deleteBoard: async (id) => {
    try {
      await api.delete(`/boards/${id}`)
      set({
        boards: get().boards.filter(b => b.id !== id),
        currentBoard: get().currentBoard?.id === id ? null : get().currentBoard
      })
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao deletar board'
    }
  },

  toggleFavorite: async (id) => {
    try {
      const response = await api.patch(`/boards/${id}/favorite`)
      set({
        boards: get().boards.map(b => 
          b.id === id ? { ...b, isFavorite: response.data.isFavorite } : b
        ),
        currentBoard: get().currentBoard?.id === id 
          ? { ...get().currentBoard, isFavorite: response.data.isFavorite } 
          : get().currentBoard
      })
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao favoritar board'
    }
  },

  // Lists
  createList: async (boardId, title) => {
    try {
      const response = await api.post('/lists', { boardId, title })
      const newList = { ...response.data, cards: [] }
      set({
        currentBoard: {
          ...get().currentBoard,
          lists: [...get().currentBoard.lists, newList]
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao criar lista'
    }
  },

  updateList: async (id, title) => {
    try {
      await api.put(`/lists/${id}`, { title })
      set({
        currentBoard: {
          ...get().currentBoard,
          lists: get().currentBoard.lists.map(l => 
            l.id === id ? { ...l, title } : l
          )
        }
      })
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao atualizar lista'
    }
  },

  deleteList: async (id) => {
    try {
      await api.delete(`/lists/${id}`)
      set({
        currentBoard: {
          ...get().currentBoard,
          lists: get().currentBoard.lists.filter(l => l.id !== id)
        }
      })
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao deletar lista'
    }
  },

  reorderLists: async (items) => {
    try {
      await api.post('/lists/reorder', { items })
    } catch (error) {
      console.error('Reorder error:', error)
    }
  },

  // Cards
  createCard: async (listId, title) => {
    try {
      const response = await api.post('/cards', { listId, title })
      set({
        currentBoard: {
          ...get().currentBoard,
          lists: get().currentBoard.lists.map(l => 
            l.id === listId 
              ? { ...l, cards: [...l.cards, response.data] } 
              : l
          )
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao criar card'
    }
  },

  updateCard: async (id, data) => {
    try {
      const response = await api.put(`/cards/${id}`, data)
      set({
        currentBoard: {
          ...get().currentBoard,
          lists: get().currentBoard.lists.map(l => ({
            ...l,
            cards: l.cards.map(c => c.id === id ? response.data : c)
          }))
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao atualizar card'
    }
  },

  moveCard: async (cardId, listId, position) => {
    try {
      await api.patch(`/cards/${cardId}/move`, { listId, position })
    } catch (error) {
      console.error('Move card error:', error)
    }
  },

  reorderCards: async (items) => {
    try {
      await api.post('/cards/reorder', { items })
    } catch (error) {
      console.error('Reorder cards error:', error)
    }
  },

  deleteCard: async (id) => {
    try {
      await api.delete(`/cards/${id}`)
      set({
        currentBoard: {
          ...get().currentBoard,
          lists: get().currentBoard.lists.map(l => ({
            ...l,
            cards: l.cards.filter(c => c.id !== id)
          }))
        }
      })
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao deletar card'
    }
  },

  clearCurrentBoard: () => set({ currentBoard: null })
}))
