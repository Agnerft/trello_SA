import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useBoardStore } from '../store/boardStore'
import toast from 'react-hot-toast'

const coverColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#1e293b'
]

export default function CreateBoardModal({ isOpen, onClose }) {
  const { createBoard } = useBoardStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(coverColors[0])
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      await createBoard({
        title: title.trim(),
        description: description.trim() || undefined,
        coverColor: selectedColor
      })
      toast.success('Quadro criado com sucesso!')
      onClose()
      setTitle('')
      setDescription('')
    } catch (error) {
      toast.error('Erro ao criar quadro')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Criar Quadro</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Nome do projeto"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              placeholder="Descrição do projeto"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor de fundo</label>
            <div className="flex flex-wrap gap-2">
              {coverColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg transition-transform hover:scale-110 ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1 btn-primary"
            >
              {isLoading ? 'Criando...' : 'Criar Quadro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
