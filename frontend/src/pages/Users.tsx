import { useEffect, useState } from 'react'
import { UserPlus, Search, Edit, Trash2, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Card, CardContent } from '../components/Card'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { Table } from '../components/Table'
import { formatDate, getRoleLabel } from '../utils/formatters'
import { User } from '../types'

const roleOptions = [
  { value: 'REQUESTER', label: 'Solicitante' },
  { value: 'ADMIN', label: 'Administrador' },
]

export function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'REQUESTER' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.users.list()
      setUsers(res.users)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    setError('')
    setFormData({ name: '', email: '', password: '', role: 'REQUESTER' })
    setShowModal(true)
  }

  const handleOpenEdit = (u: User) => {
    setEditingUser(u)
    setError('')
    setFormData({ name: u.name, email: u.email, password: '', role: u.role })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (editingUser) {
        const { password, ...data } = formData
        const updateData = password ? { ...data, password } : data
        await api.users.update(editingUser.id, updateData)
      } else {
        await api.users.create(formData)
      }
      await fetchUsers()
      setShowModal(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar usuário')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    setPageError('')
    try {
      await api.users.delete(deletingUser.id)
      await fetchUsers()
    } catch (err: any) {
      setPageError(err.message || 'Erro ao excluir usuário')
    } finally {
      setDeletingUser(null)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name', header: 'Nome', render: (u: User) => u.name },
    { key: 'email', header: 'Email', render: (u: User) => u.email },
    { key: 'role', header: 'Perfil', render: (u: User) => (
      <Badge variant={u.role === 'ADMIN' ? 'primary' : 'gray'}>
        <Shield className="w-3 h-3 mr-1" />
        {getRoleLabel(u.role)}
      </Badge>
    )},
    { key: 'createdAt', header: 'Criado em', render: (u: User) => formatDate(u.createdAt) },
    { key: 'actions', header: 'Ações', render: (u: User) => (
      <div className="flex items-center gap-2">
        {u.id !== user?.id && (
          <>
            <button
              onClick={() => handleOpenEdit(u)}
              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Editar usuário"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeletingUser(u)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Excluir usuário"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {pageError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {pageError}
        </div>
      )}

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            label="Pesquisar"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto" />
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredUsers}
              keyExtractor={(u) => u.id}
              emptyMessage="Nenhum usuário encontrado"
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}
          <Input
            label="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label={editingUser ? 'Nova senha (deixe em branco para não alterar)' : 'Senha'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required={!editingUser}
            helperText={editingUser ? 'Mínimo 6 caracteres' : 'Mínimo 6 caracteres'}
          />
          <Select
            label="Perfil"
            options={roleOptions}
            value={formData.role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingUser ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Excluir Usuário"
      >
        <p className="text-gray-600 mb-6">
          Tem certeza que deseja excluir o usuário <strong>{deletingUser?.name}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeletingUser(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  )
}