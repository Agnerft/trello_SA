import { useEffect, useState } from 'react'
import { PlusIcon, StarIcon, EllipsisHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useBoardStore } from '../store/boardStore'
import CreateBoardModal from '../components/CreateBoardModal'
import toast from 'react-hot-toast'

const coverColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#1e293b'
]

export default function Boards() {
  const { boards, fetchBoards, toggleFavorite, deleteBoard, isLoading } = useBoardStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [menuOpen, setMenuOpen] = useState(null)

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  const filteredBoards = boards.filter(board => {
    if (filter === 'favorites') return board.isFavorite
    if (filter === 'recent') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return new Date(board.updatedAt) > oneWeekAgo
    }
    return true
  })

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este quadro?')) {
      try {
        await deleteBoard(id)
        toast.success('Quadro excluído')
      } catch (error) {
        toast.error('Erro ao excluir quadro')
      }
    }
    setMenuOpen(null)
  }

  const handleFavorite = async (id) => {
    try {
      await toggleFavorite(id)
    } catch (error) {
      toast.error('Erro ao favoritar')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Quadros</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seus projetos e tarefas</p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Novo Quadro
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'favorites', label: 'Favoritos' },
          { key: 'recent', label: 'Recentes' }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Boards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredBoards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Create New Card */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 flex items-center justify-center transition-colors">
              <PlusIcon className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
            </div>
            <span className="font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary-600">Criar novo quadro</span>
          </button>

          {/* Board Cards */}
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              className="group relative h-40 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ 
                backgroundColor: board.coverColor || '#6366f1',
                backgroundImage: board.coverImage ? `url(${board.coverImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <a href={`/board/${board.id}`} className="absolute inset-0">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </a>

              <div className="absolute inset-0 p-4 flex flex-col">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-white text-lg line-clamp-2 flex-1">{board.title}</h3>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleFavorite(board.id)
                      }}
                      className="p-1.5 rounded hover:bg-white/20 transition-colors"
                    >
                      {board.isFavorite ? (
                        <StarIconSolid className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-5 h-5 text-white/80 hover:text-yellow-400" />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setMenuOpen(menuOpen === board.id ? null : board.id)
                        }}
                        className="p-1.5 rounded hover:bg-white/20 transition-colors"
                      >
                        <EllipsisHorizontalIcon className="w-5 h-5 text-white/80" />
                      </button>

                      {menuOpen === board.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 animate-fade-in">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDelete(board.id)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-white/80 text-sm">{board._count?.lists || 0} listas</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Nenhum quadro encontrado</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Crie seu primeiro quadro para começar</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            Criar Quadro
          </button>
        </div>
      )}

      {/* Create Modal */}
      <CreateBoardModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  )
}
