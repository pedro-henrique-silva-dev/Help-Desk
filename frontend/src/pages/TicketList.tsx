import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, TicketPlus } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Card, CardContent } from '../components/Card'
import { Badge } from '../components/Badge'
import { Table } from '../components/Table'
import { formatDate, getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getCategoryLabel } from '../utils/formatters'
import { Ticket } from '../types'

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'OPEN', label: 'Aberto' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'CLOSED', label: 'Concluído' },
]

const categoryOptions = [
  { value: '', label: 'Todas as categorias' },
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'NETWORK', label: 'Rede' },
  { value: 'SYSTEMS', label: 'Sistemas' },
  { value: 'OTHERS', label: 'Outros' },
]

const priorityOptions = [
  { value: '', label: 'Todas as prioridades' },
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
]

export function TicketList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '')
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '')

  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      try {
        const params: any = { page, limit: 10 }
        if (search) params.search = search
        if (statusFilter) params.status = statusFilter
        if (categoryFilter) params.category = categoryFilter
        if (priorityFilter) params.priority = priorityFilter

        const res = await api.tickets.list(params)
        setTickets(res.tickets)
        setPagination(res.pagination)
      } catch (error) {
        console.error('Erro ao carregar chamados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [page, search, statusFilter, categoryFilter, priorityFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    setSearchParams(params)
  }

  const columns = [
    { key: 'number', header: 'Número', render: (t: Ticket) => <span className="font-mono font-medium">#{t.number}</span> },
    { key: 'title', header: 'Título', render: (t: Ticket) => <span className="font-medium truncate max-w-xs">{t.title}</span> },
    { key: 'requester', header: 'Solicitante', render: (t: Ticket) => t.requester.name },
    { key: 'category', header: 'Categoria', render: (t: Ticket) => getCategoryLabel(t.category) },
    { key: 'priority', header: 'Prioridade', render: (t: Ticket) => (
      <Badge variant={getPriorityColor(t.priority) as any}>{getPriorityLabel(t.priority)}</Badge>
    )},
    { key: 'status', header: 'Status', render: (t: Ticket) => (
      <Badge variant={getStatusColor(t.status) as any}>{getStatusLabel(t.status)}</Badge>
    )},
    { key: 'createdAt', header: 'Data de abertura', render: (t: Ticket) => formatDate(t.createdAt) },
    { key: 'actions', header: 'Ação', render: (t: Ticket) => (
      <Link to={`/tickets/${t.id}`} className="text-primary-600 hover:text-primary-500 font-medium text-sm">
        Ver detalhes
      </Link>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chamados</h1>
          <p className="text-gray-600">Gerencie e acompanhe todos os chamados</p>
        </div>
        <Link to="/tickets/new">
          <Button>
            <TicketPlus className="w-4 h-4 mr-2" />
            Novo Chamado
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                label="Pesquisar"
                placeholder="Buscar por título ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
            <Select
              label="Categoria"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            />
            <Select
              label="Prioridade"
              options={priorityOptions}
              value={priorityFilter}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            />
          </div>
          {search || statusFilter || categoryFilter || priorityFilter ? (
            <Button type="button" variant="outline" onClick={() => {
              setSearch('')
              setStatusFilter('')
              setCategoryFilter('')
              setPriorityFilter('')
              const params = new URLSearchParams()
              setSearchParams(params)
            }}>
              Limpar filtros
            </Button>
          ) : null}
        </form>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto" />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={tickets}
                keyExtractor={(t) => t.id}
                emptyMessage="Nenhum chamado encontrado"
              />
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, pagination.total)} de {pagination.total} resultados
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set('page', String(page - 1))
                        setSearchParams(params)
                      }}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set('page', String(page + 1))
                        setSearchParams(params)
                      }}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}