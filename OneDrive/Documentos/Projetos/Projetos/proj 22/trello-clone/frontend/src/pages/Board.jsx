import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable'
import { ArrowLeftIcon, StarIcon, EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useBoardStore } from '../store/boardStore'
import List from '../components/List'
import Card from '../components/Card'
import CardModal from '../components/CardModal'
import toast from 'react-hot-toast'

export default function Board() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { 
    currentBoard, 
    fetchBoard, 
    toggleFavorite, 
    createList, 
    reorderLists, 
    reorderCards,
    moveCard,
    isLoading 
  } = useBoardStore()
  
  const [activeId, setActiveId] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [newListTitle, setNewListTitle] = useState('')
  const [isAddingList, setIsAddingList] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  useEffect(() => {
    fetchBoard(id)
  }, [id, fetchBoard])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    setActiveType(active.data.current?.type)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveCard = active.data.current?.type === 'card'
    const isOverCard = over.data.current?.type === 'card'
    const isOverList = over.data.current?.type === 'list'

    if (!isActiveCard) return

    // Dropping over a card
    if (isActiveCard && isOverCard) {
      // Handle card reordering within/across lists
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      setActiveType(null)
      return
    }

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) {
      setActiveId(null)
      setActiveType(null)
      return
    }

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    if (activeType === 'list' && overType === 'list') {
      // Reorder lists
      const oldIndex = currentBoard.lists.findIndex(l => l.id === activeId)
      const newIndex = currentBoard.lists.findIndex(l => l.id === overId)
      
      const newLists = arrayMove(currentBoard.lists, oldIndex, newIndex)
      useBoardStore.setState({
        currentBoard: { ...currentBoard, lists: newLists }
      })
      
      reorderLists(newLists.map((l, i) => ({ id: l.id, position: i })))
    }

    if (activeType === 'card') {
      const activeCard = currentBoard.lists
        .flatMap(l => l.cards)
        .find(c => c.id === activeId)
      
      if (overType === 'list') {
        // Move card to list
        const newListId = overId
        moveCard(activeId, newListId, 0)
      } else if (overType === 'card') {
        // Move card before/after another card
        const overCard = currentBoard.lists
          .flatMap(l => l.cards)
          .find(c => c.id === overId)
        
        if (activeCard && overCard) {
          moveCard(activeId, overCard.listId, overCard.position)
        }
      }
    }

    setActiveId(null)
    setActiveType(null)
  }

  const handleAddList = async () => {
    if (!newListTitle.trim()) return
    try {
      await createList(id, newListTitle.trim())
      setNewListTitle('')
      setIsAddingList(false)
      toast.success('Lista criada')
    } catch (error) {
      toast.error('Erro ao criar lista')
    }
  }

  const handleFavorite = async () => {
    try {
      await toggleFavorite(id)
    } catch (error) {
      toast.error('Erro ao favoritar')
    }
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } }
    })
  }

  if (isLoading || !currentBoard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const activeCard = activeType === 'card' 
    ? currentBoard.lists.flatMap(l => l.cards).find(c => c.id === activeId)
    : null

  return (
    <div 
      className="fixed inset-0 pt-16 overflow-hidden"
      style={{ 
        backgroundColor: currentBoard.coverColor || '#6366f1',
        backgroundImage: currentBoard.coverImage ? `url(${currentBoard.coverImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative h-full flex flex-col">
        {/* Board Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/boards')}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-white">{currentBoard.title}</h1>
              {currentBoard.description && (
                <p className="text-white/70 text-sm">{currentBoard.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              {currentBoard.isFavorite ? (
                <StarIconSolid className="w-5 h-5 text-yellow-400" />
              ) : (
                <StarIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Lists */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex items-start gap-4 h-full p-6">
              <SortableContext 
                items={currentBoard.lists.map(l => l.id)}
                strategy={horizontalListSortingStrategy}
              >
                {currentBoard.lists.map((list) => (
                  <List 
                    key={list.id} 
                    list={list}
                    onCardClick={setSelectedCard}
                  />
                ))}
              </SortableContext>

              {/* Add List */}
              <div className="flex-shrink-0 w-80">
                {isAddingList ? (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 shadow-lg">
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddList()
                        if (e.key === 'Escape') {
                          setIsAddingList(false)
                          setNewListTitle('')
                        }
                      }}
                      placeholder="Nome da lista"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleAddList}
                        className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingList(false)
                          setNewListTitle('')
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar lista
                  </button>
                )}
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeType === 'card' && activeCard ? (
              <Card card={activeCard} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Modal */}
      <CardModal 
        card={selectedCard}
        boardId={id}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  )
}
