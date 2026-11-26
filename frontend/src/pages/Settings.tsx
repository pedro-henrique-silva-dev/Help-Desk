import { useState, useEffect } from 'react'
import { User, Lock, Save, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'

const NOTIF_STORAGE_KEY = 'helpdesk_notification_prefs'

export function Settings() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIF_STORAGE_KEY)
      return saved ? JSON.parse(saved) : { assigned: true, statusUpdates: true, comments: false }
    } catch {
      return { assigned: true, statusUpdates: true, comments: false }
    }
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name, email: user.email })
    }
  }, [user])

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ]

  const handleProfileSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await api.auth.updateProfile(profileData)
      updateUser(res.user)
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar perfil' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      return
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await api.auth.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao alterar senha' })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationsSave = () => {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifPrefs))
    setMessage({ type: 'success', text: 'Preferências de notificação salvas!' })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-48 flex-shrink-0">
          <nav className="space-y-1" aria-label="Configurações">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </Card>

        <div className="flex-1">
          {message && (
            <div className={`mb-4 p-4 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`} role="alert">
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nome completo"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-3">Perfil de acesso: <span className="font-medium text-gray-900">{user?.role === 'ADMIN' ? 'Administrador' : 'Solicitante'}</span></p>
                  <p className="text-sm text-gray-500">Membro desde: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
                <Button onClick={handleProfileSave} loading={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Senha atual"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                <Input
                  label="Nova senha"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  helperText="Mínimo 6 caracteres"
                />
                <Input
                  label="Confirmar nova senha"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <Button onClick={handlePasswordSave} loading={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Alterar senha
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Email</h3>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Novos chamados atribuídos</p>
                      <p className="text-sm text-gray-500">Receba email quando um chamado for atribuído a você</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.assigned}
                      onChange={(e) => setNotifPrefs((prev: any) => ({ ...prev, assigned: e.target.checked }))}
                      className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Atualizações de status</p>
                      <p className="text-sm text-gray-500">Receba email quando o status de um chamado seu for alterado</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.statusUpdates}
                      onChange={(e) => setNotifPrefs((prev: any) => ({ ...prev, statusUpdates: e.target.checked }))}
                      className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Comentários em chamados</p>
                      <p className="text-sm text-gray-500">Receba email quando houver novos comentários</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.comments}
                      onChange={(e) => setNotifPrefs((prev: any) => ({ ...prev, comments: e.target.checked }))}
                      className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                  </label>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Button variant="outline" onClick={handleNotificationsSave}>Salvar preferências</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}