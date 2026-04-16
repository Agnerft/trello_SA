import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { 
  UserCircleIcon, 
  MoonIcon, 
  SunIcon, 
  BellIcon, 
  ShieldCheckIcon,
  LanguageIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, you'd call the API here
      updateUser({ name })
      toast.success('Perfil atualizado')
    } catch (error) {
      toast.error('Erro ao atualizar')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas preferências e perfil</p>
      </div>

      {/* Profile Section */}
      <section className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Perfil</h2>
            <p className="text-gray-500">Atualize suas informações pessoais</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || name === user?.name}
            className="btn-primary"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            {isDark ? (
              <MoonIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <SunIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aparência</h2>
            <p className="text-gray-500 text-sm">Personalize a aparência do aplicativo</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-3">
            {isDark ? (
              <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{isDark ? 'Modo Escuro' : 'Modo Claro'}</p>
              <p className="text-sm text-gray-500">{isDark ? 'Mais fácil para os olhos à noite' : 'Aparência padrão'}</p>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isDark ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                isDark ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notificações</h2>
            <p className="text-gray-500 text-sm">Gerencie suas preferências de notificação</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Tarefas próximas do vencimento', default: true },
            { label: 'Novos comentários', default: true },
            { label: 'Atualizações de quadros', default: false },
            { label: 'Emails semanais', default: true }
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <input 
                type="checkbox" 
                defaultChecked={item.default}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Atalhos de Teclado</h2>
            <p className="text-gray-500 text-sm">Aumente sua produtividade</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: 'Ctrl + K', action: 'Buscar' },
            { key: 'Ctrl + N', action: 'Novo quadro' },
            { key: 'Ctrl + B', action: 'Meus quadros' },
            { key: 'Esc', action: 'Fechar modal' }
          ].map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">{shortcut.action}</span>
              <kbd className="px-3 py-1 bg-white dark:bg-gray-600 rounded-lg text-sm font-mono text-gray-600 dark:text-gray-300 shadow-sm">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
