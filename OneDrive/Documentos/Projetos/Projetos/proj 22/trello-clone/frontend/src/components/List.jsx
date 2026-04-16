import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlusIcon, EllipsisHorizontalIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useBoardStore } from '../store/boardStore'
import Card from './Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import toast from 'react-hot-toast'

export default function List({ list, onCardClick }) {
  const { deleteList, updateList, createCard } = useBoardStore()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: list.id,
    data: { type: 'list', list }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleUpdateTitle = async () => {
    if (!title.trim() || title === list.title) {
      setTitle(list.title)
      setIsEditing(false)
      return
    }
    try {
      await updateList(list.id, title.trim())
      setIsEditing(false)
      toast.success('Lista atualizada')
    } catch (error) {
      toast.error('Erro ao atualizar')
      setTitle(list.title)
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta lista?')) {
      try {
        await deleteList(list.id)
        toast.success('Lista excluída')
      } catch (error) {
        toast.error('Erro ao excluir')
      }
    }
    setShowMenu(false)
  }

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return
    try {
      await createCard(list.id, newCardTitle.trim())
      setNewCardTitle('')
      setIsAddingCard(false)
      toast.success('Card criado')
    } catch (error) {
      toast.error('Erro ao criar card')
    }
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex-shrink-0 w-80 bg-gray-200 dark:bg-gray-700 rounded-xl opacity-50"
      >
        <div className="p-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg flex flex-col max-h-full"
    >
      {/* Header */}
      <div 
        {...attributes} 
        {...listeners}
        className="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTitle()
              if (e.key === 'Escape') {
                setTitle(list.title)
                setIsEditing(false)
              }
            }}
            className="flex-1 px-2 py-1 rounded bg-white dark:bg-gray-700 border border-primary-500 focus:outline-none"
            autoFocus
          />
        ) : (
          <h3 
            onClick={() => setIsEditing(true)}
            className="font-semibold text-gray-800 dark:text-gray-200 flex-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
          >
            {list.title}
          </h3>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-20 animate-fade-in">
              <button
                onClick={() => {
                  setIsEditing(true)
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <PencilIcon className="w-4 h-4" />
                Renomear
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <TrashIcon className="w-4 h-4" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 scrollbar-thin">
        <SortableContext 
          items={list.cards.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {list.cards.map((card) => (
              <Card 
                key={card.id} 
                card={card}
                onClick={() => onCardClick(card)}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Add Card */}
      <div className="p-3">
        {isAddingCard ? (
          <div className="space-y-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddCard()
                }
                if (e.key === 'Escape') {
                  setIsAddingCard(false)
                  setNewCardTitle('')
                }
              }}
              placeholder="Digite o título do card..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCard}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setIsAddingCard(false)
                  setNewCardTitle('')
                }}
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar card
          </button>
        )}
      </div>
    </div>
  )
}
