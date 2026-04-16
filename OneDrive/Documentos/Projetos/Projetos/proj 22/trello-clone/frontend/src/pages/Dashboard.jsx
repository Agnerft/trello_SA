import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Squares2X2Icon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  FireIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { useBoardStore } from '../store/boardStore'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const { boards, fetchBoards, isLoading } = useBoardStore()

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  // Calculate stats
  const totalBoards = boards.length
  const favoriteBoards = boards.filter(b => b.isFavorite).length
  
  // Get all cards from all boards
  const allCards = boards.flatMap(board => 
    board.lists?.flatMap(list => list.cards || []) || []
  )
  
  const totalCards = allCards.length
  const completedCards = allCards.filter(c => c.list?.title?.toLowerCase().includes('concluído')).length
  const overdueCards = allCards.filter(c => c.dueDate && isPast(parseISO(c.dueDate)) && !c.list?.title?.toLowerCase().includes('concluído')).length
  const dueTodayCards = allCards.filter(c => c.dueDate && isToday(parseISO(c.dueDate))).length
  const highPriorityCards = allCards.filter(c => c.priority === 'high').length

  const stats = [
    { 
      label: 'Total de Quadros', 
      value: totalBoards, 
      icon: Squares2X2Icon, 
      color: 'bg-blue-500',
      link: '/boards'
    },
    { 
      label: 'Tarefas Totais', 
      value: totalCards, 
      icon: CheckCircleIcon, 
      color: 'bg-green-500',
      link: '/boards'
    },
    { 
      label: 'Concluídas', 
      value: completedCards, 
      icon: CheckCircleIcon, 
      color: 'bg-emerald-500',
      link: '/boards'
    },
    { 
      label: 'Vencendo Hoje', 
      value: dueTodayCards, 
      icon: ClockIcon, 
      color: 'bg-yellow-500',
      link: '/boards'
    },
    { 
      label: 'Atrasadas', 
      value: overdueCards, 
      icon: ExclamationTriangleIcon, 
      color: 'bg-red-500',
      link: '/boards'
    },
    { 
      label: 'Alta Prioridade', 
      value: highPriorityCards, 
      icon: FireIcon, 
      color: 'bg-orange-500',
      link: '/boards'
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Visão geral dos seus projetos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="card-hover p-6 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Boards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quadros Recentes</h2>
          <Link to="/boards" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium">
            Ver todos
          </Link>
        </div>

        {boards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.slice(0, 4).map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="group relative h-32 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                style={{ 
                  backgroundColor: board.coverColor || '#6366f1',
                  backgroundImage: board.coverImage ? `url(${board.coverImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-white text-lg line-clamp-2">{board.title}</h3>
                    {board.isFavorite && (
                      <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-white/80 text-sm">{board._count?.lists || 0} listas</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Squares2X2Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum quadro ainda</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Crie seu primeiro quadro para começar a organizar suas tarefas</p>
            <Link to="/boards" className="btn-primary">Criar Quadro</Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/boards" className="card-hover p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Squares2X2Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Meus Quadros</h3>
            <p className="text-sm text-gray-500">Gerencie todos os seus projetos</p>
          </div>
          <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400 ml-auto" />
        </Link>

        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <FireIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Produtividade</h3>
            <p className="text-sm text-gray-500">{completedCards} de {totalCards} tarefas concluídas</p>
          </div>
          <div className="ml-auto">
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                  className="text-primary-500"
                  strokeDasharray={`${(completedCards / (totalCards || 1)) * 175.9} 175.9`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
