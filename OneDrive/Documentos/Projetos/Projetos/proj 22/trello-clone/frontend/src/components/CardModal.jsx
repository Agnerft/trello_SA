import { useEffect, useState } from 'react'
import { 
  XMarkIcon, 
  ClockIcon, 
  FlagIcon, 
  TrashIcon, 
  ArchiveBoxIcon,
  CheckCircleIcon,
  PlusIcon,
  PaperClipIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../lib/axios'
import { useBoardStore } from '../store/boardStore'
import toast from 'react-hot-toast'

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-blue-500' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'bg-red-500' }
]

export default function CardModal({ card, boardId, isOpen, onClose }) {
  const { updateCard, deleteCard, currentBoard } = useBoardStore()
  const [cardData, setCardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (card?.id && isOpen) {
      fetchCardDetails()
    }
  }, [card?.id, isOpen])

  const fetchCardDetails = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/cards/${card.id}`)
      setCardData(response.data)
    } catch (error) {
      toast.error('Erro ao carregar detalhes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data) => {
    try {
      await updateCard(card.id, data)
      setCardData({ ...cardData, ...data })
      toast.success('Atualizado')
    } catch (error) {
      toast.error('Erro ao atualizar')
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este card?')) {
      try {
        await deleteCard(card.id)
        onClose()
        toast.success('Card excluído')
      } catch (error) {
        toast.error('Erro ao excluir')
      }
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      const response = await api.post(`/cards/${card.id}/comments`, { text: newComment })
      setCardData({
        ...cardData,
        comments: [response.data, ...cardData.comments]
      })
      setNewComment('')
      toast.success('Comentário adicionado')
    } catch (error) {
      toast.error('Erro ao adicionar comentário')
    }
  }

  const handleAddChecklist = async () => {
    const title = prompt('Nome do checklist:')
    if (!title) return
    try {
      const response = await api.post(`/cards/${card.id}/checklists`, { 
        title,
        items: []
      })
      setCardData({
        ...cardData,
        checklists: [...cardData.checklists, response.data]
      })
      toast.success('Checklist criado')
    } catch (error) {
      toast.error('Erro ao criar checklist')
    }
  }

  const toggleChecklistItem = async (itemId, completed) => {
    try {
      await api.patch(`/cards/checklist-items/${itemId}`, { completed })
      setCardData({
        ...cardData,
        checklists: cardData.checklists.map(cl => ({
          ...cl,
          items: cl.items.map(item => 
            item.id === itemId ? { ...item, completed } : item
          )
        }))
      })
    } catch (error) {
      toast.error('Erro ao atualizar')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : cardData ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <input
                  type="text"
                  value={cardData.title}
                  onChange={(e) => {
                    setCardData({ ...cardData, title: e.target.value })
                    handleUpdate({ title: e.target.value })
                  }}
                  className="w-full text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-1">
                  na lista <span className="font-medium">{cardData.list?.title}</span>
                </p>
              </div>
              
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { key: 'details', label: 'Detalhes', icon: null },
                { key: 'comments', label: `Comentários (${cardData.comments?.length || 0})`, icon: ChatBubbleLeftIcon },
                { key: 'checklists', label: 'Checklists', icon: CheckCircleIcon }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</h4>
                    <textarea
                      value={cardData.description || ''}
                      onChange={(e) => {
                        setCardData({ ...cardData, description: e.target.value })
                        handleUpdate({ description: e.target.value })
                      }}
                      placeholder="Adicione uma descrição..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data de Vencimento</h4>
                    <input
                      type="datetime-local"
                      value={cardData.dueDate ? format(parseISO(cardData.dueDate), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => handleUpdate({ dueDate: e.target.value || null })}
                      className="input"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridade</h4>
                    <div className="flex gap-2">
                      {priorityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleUpdate({ priority: opt.value })}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            cardData.priority === opt.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${opt.color}`} />
                          <span className="text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Labels */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      {cardData.labels?.map((label) => (
                        <span
                          key={label.id}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: label.color + '20', color: label.color }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {cardData.assignee?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="mt-2 btn-primary text-sm"
                      >
                        Comentar
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {cardData.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {comment.author?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{comment.author?.name}</span>
                            <span className="text-xs text-gray-500">
                              {format(parseISO(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'checklists' && (
                <div className="space-y-6">
                  <button
                    onClick={handleAddChecklist}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Checklist
                  </button>

                  {cardData.checklists?.map((checklist) => {
                    const completedItems = checklist.items.filter(i => i.completed).length
                    const progress = checklist.items.length > 0 
                      ? (completedItems / checklist.items.length) * 100 
                      : 0

                    return (
                      <div key={checklist.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">{checklist.title}</h4>
                          <span className="text-sm text-gray-500">
                            {completedItems}/{checklist.items.length}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-4">
                          <div 
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {checklist.items.map((item) => (
                            <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) => toggleChecklistItem(item.id, e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className={`${item.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                {item.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <TrashIcon className="w-5 h-5" />
                Excluir
              </button>

              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Fechar
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
