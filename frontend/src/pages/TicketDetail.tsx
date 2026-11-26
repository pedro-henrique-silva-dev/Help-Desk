import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Clock, User, Tag, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { Button } from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { Select } from '../components/Select'
import { Input } from '../components/Input'
import { formatDate, getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getCategoryLabel } from '../utils/formatters'
import { Ticket } from '../types'

const statusOptions = [
  { value: 'OPEN', label: 'Aberto' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'CLOSED', label: 'Concluído' },
]

const priorityOptions = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
]

const categoryOptions = [
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'NETWORK', label: 'Rede' },
  { value: 'SYSTEMS', label: 'Sistemas' },
  { value: 'OTHERS', label: 'Outros' },
]

export function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    status: '',
  })

  useEffect(() => {
    if (id) fetchTicket()
  }, [id])

  const fetchTicket = async () => {
    try {
      const res = await api.tickets.get(id!)
      setTicket(res.ticket)
      setEditData({
        title: res.ticket.title,
        description: res.ticket.description,
        category: res.ticket.category,
        priority: res.ticket.priority,
        status: res.ticket.status,
      })
    } catch (error) {
      console.error('Erro ao carregar chamado:', error)
      navigate('/tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (overrideData?: Partial<typeof editData>) => {
    const payload = overrideData ? { ...editData, ...overrideData } : editData
    setEditData(payload)
    setUpdating(true)
    try {
      const res = await api.tickets.update(id!, payload)
      setTicket(res.ticket)
      setShowEditModal(false)
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.tickets.delete(id!)
      navigate('/tickets')
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setShowDeleteModal(false)
    }
  }

  const canEdit = isAdmin || ticket?.requesterId === user?.id

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Chamado não encontrado</h2>
        <p className="text-gray-500 mt-1">O chamado solicitado não existe ou foi removido.</p>
        <Button variant="outline" onClick={() => navigate('/tickets')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chamado #{ticket.number}</h1>
          <p className="text-gray-600">{ticket.title}</p>
        </div>
        <div className="flex-1" />
        {canEdit && (
          <>
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            {isAdmin && (
              <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="w-4 h-4 mr-1" />
                Excluir
              </Button>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{ticket.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Solicitante</dt>
                  <dd className="mt-1 flex items-center gap-2 font-medium">
                    <User className="w-4 h-4 text-gray-400" />
                    {ticket.requester.name}
                    <span className="text-gray-400">({ticket.requester.email})</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Categoria</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <Badge variant="gray">{getCategoryLabel(ticket.category)}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Prioridade</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <Badge variant={getPriorityColor(ticket.priority) as any}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <Badge variant={getStatusColor(ticket.status) as any}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Data de abertura</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatDate(ticket.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Última atualização</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-gray-400" />
                    {formatDate(ticket.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAdmin && (
                <>
                  <Select
                    label="Alterar Status"
                    options={statusOptions}
                    value={ticket.status}
                    disabled={updating}
                    onChange={(e) => handleUpdate({ status: e.target.value })}
                  />
                  <Select
                    label="Alterar Prioridade"
                    options={priorityOptions}
                    value={ticket.priority}
                    disabled={updating}
                    onChange={(e) => handleUpdate({ priority: e.target.value })}
                  />
                </>
              )}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  {isAdmin 
                    ? 'Como administrador, você pode alterar status e prioridade.' 
                    : 'Apenas administradores podem alterar status e prioridade.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ticket.requester.name}</p>
                  <p className="text-sm text-gray-500">{ticket.requester.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Chamado"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate() }} className="space-y-4">
          <Input
            label="Título"
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <div className="space-y-1">
            <label className="label">Descrição</label>
            <textarea
              value={editData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="input min-h-[120px] resize-y"
              required
            />
          </div>
          <Select
            label="Categoria"
            options={categoryOptions}
            value={editData.category}
            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Prioridade"
              options={priorityOptions}
              value={editData.priority}
              onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
            />
            {isAdmin && (
              <Select
                label="Status"
                options={statusOptions}
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={updating}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Chamado"
      >
        <p className="text-gray-600 mb-6">
          Tem certeza que deseja excluir o chamado <strong>#{ticket.number} - {ticket.title}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={updating}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  )
}