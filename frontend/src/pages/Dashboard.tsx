import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TicketPlus, TicketCheck, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { formatDate, getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor } from '../utils/formatters'
import { DashboardStats, Ticket } from '../types'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  bgColor: string
  link?: string
}

function StatCard({ title, value, icon, bgColor, link }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {link && (
              <Link to={link} className="mt-3 inline-flex items-center text-sm text-primary-600 hover:text-primary-500 font-medium">
                Ver detalhes <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          isAdmin ? api.dashboard.stats() : api.dashboard.myStats(),
          isAdmin ? api.dashboard.recent() : api.dashboard.myRecent(),
        ])
        setStats(statsRes.stats)
        setRecentTickets(ticketsRes.tickets)
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos chamados</p>
        </div>
        <Link to="/tickets/new">
          <Button>
            <TicketPlus className="w-4 h-4 mr-2" />
            Novo Chamado
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de chamados"
          value={stats?.total || 0}
          icon={<TicketCheck className="w-6 h-6 text-primary-600" />}
          bgColor="bg-primary-100"
          link="/tickets"
        />
        <StatCard
          title="Abertos"
          value={stats?.open || 0}
          icon={<Clock className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-100"
          link="/tickets?status=OPEN"
        />
        <StatCard
          title="Em andamento"
          value={stats?.inProgress || 0}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          bgColor="bg-yellow-100"
          link="/tickets?status=IN_PROGRESS"
        />
        <StatCard
          title="Concluídos"
          value={stats?.closed || 0}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-100"
          link="/tickets?status=CLOSED"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chamados Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum chamado encontrado
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-gray-900 truncate">
                        #{ticket.number} - {ticket.title}
                      </span>
                      <Badge variant={getPriorityColor(ticket.priority) as any}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                      <Badge variant={getStatusColor(ticket.status) as any}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>{ticket.requester.name}</span>
                      <span>{getCategoryLabel(ticket.category)}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    HARDWARE: 'Hardware',
    SOFTWARE: 'Software',
    NETWORK: 'Rede',
    SYSTEMS: 'Sistemas',
    OTHERS: 'Outros',
  }
  return labels[category] || category
}