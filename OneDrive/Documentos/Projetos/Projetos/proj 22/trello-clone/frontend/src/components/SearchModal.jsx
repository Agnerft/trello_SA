import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'
import api from '../lib/axios'

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  const searchCards = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await api.get(`/cards/search/${encodeURIComponent(searchQuery)}`)
      setResults(response.data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCards(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchCards])

  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen ? onClose() : null
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleCardClick = (card) => {
    // Save to recent searches
    const newRecent = [card, ...recentSearches.filter(r => r.id !== card.id)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recent-searches', JSON.stringify(newRecent))
    
    navigate(`/board/${card.list.board.id}?card=${card.id}`)
    onClose()
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tarefas..."
            className="flex-1 bg-transparent text-lg outline-none placeholder-gray-400 dark:text-white"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <kbd className="hidden sm:block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Buscando...</div>
          ) : query && results.length > 0 ? (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Resultados</p>
              {results.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{card.title}</p>
                    <p className="text-sm text-gray-500">
                      {card.list.board.title} → {card.list.title}
                    </p>
                    {card.labels.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {card.labels.map(label => (
                          <span 
                            key={label.id}
                            className="px-2 py-0.5 text-xs rounded-full"
                            style={{ backgroundColor: label.color, color: '#fff' }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-gray-500">Nenhum resultado encontrado</div>
          ) : recentSearches.length > 0 ? (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Buscas recentes</p>
              {recentSearches.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{card.title}</p>
                    <p className="text-sm text-gray-500">{card.list?.board?.title}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Digite para buscar tarefas...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
