import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  ClockIcon, 
  ChatBubbleLeftIcon, 
  PaperClipIcon,
  CheckCircleIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const priorityColors = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta'
}

export default function Card({ card, onClick, isOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id,
    data: { type: 'card', card }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const isOverdue = card.dueDate && isPast(parseISO(card.dueDate)) && !isToday(parseISO(card.dueDate))
  const isDueToday = card.dueDate && isToday(parseISO(card.dueDate))

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-lg opacity-50 rotate-2"
      >
        <p className="text-gray-900 dark:text-white font-medium">{card.title}</p>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
        isOverlay ? 'rotate-2 shadow-xl' : ''
      }`}
    >
      {/* Cover */}
      {card.coverColor && (
        <div 
          className="h-2 -mx-3 -mt-3 mb-3 rounded-t-lg"
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      {/* Labels */}
      {card.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="px-2 py-0.5 text-xs rounded-full font-medium"
              style={{ 
                backgroundColor: label.color + '20',
                color: label.color 
              }}
            >
              {label.name}
            </span>
          ))}
          {card.labels.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
              +{card.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <p className="text-gray-900 dark:text-white font-medium line-clamp-2 mb-2">{card.title}</p>

      {/* Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Priority */}
        {card.priority && card.priority !== 'medium' && (
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priorityColors[card.priority]}`}>
            <FlagIcon className="w-3 h-3" />
            {priorityLabels[card.priority]}
          </span>
        )}

        {/* Due Date */}
        {card.dueDate && (
          <span className={`flex items-center gap-1 text-xs ${
            isOverdue 
              ? 'text-red-600 dark:text-red-400' 
              : isDueToday 
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-500 dark:text-gray-400'
          }`}>
            <ClockIcon className="w-3.5 h-3.5" />
            {format(parseISO(card.dueDate), 'dd/MM', { locale: ptBR })}
          </span>
        )}

        {/* Comments */}
        {card._count?.comments > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
            {card._count.comments}
          </span>
        )}

        {/* Attachments */}
        {card._count?.attachments > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <PaperClipIcon className="w-3.5 h-3.5" />
            {card._count.attachments}
          </span>
        )}

        {/* Checklists */}
        {card._count?.checklists > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            {card._count.checklists}
          </span>
        )}

        {/* Assignee */}
        {card.assignee && (
          <div className="ml-auto">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
              {card.assignee.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
