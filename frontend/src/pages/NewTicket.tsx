import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TicketPlus } from 'lucide-react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { api } from '../services/api'

const categoryOptions = [
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'NETWORK', label: 'Rede' },
  { value: 'SYSTEMS', label: 'Sistemas' },
  { value: 'OTHERS', label: 'Outros' },
]

const priorityOptions = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
]

export function NewTicket() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'Título deve ter pelo menos 5 caracteres'
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres'
    }
    if (!category) {
      newErrors.category = 'Selecione uma categoria'
    }
    if (!priority) {
      newErrors.priority = 'Selecione uma prioridade'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await api.tickets.create({ title, description, category, priority })
      navigate(`/tickets/${res.ticket.id}`)
    } catch (error: any) {
      if (error.data?.details) {
        const fieldErrors: Record<string, string> = {}
        error.data.details.forEach((d: any) => {
          fieldErrors[d.field] = d.message
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ form: error.message || 'Erro ao criar chamado' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Chamado</h1>
          <p className="text-gray-600">Preencha as informações para abrir um chamado de suporte</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TicketPlus className="w-5 h-5 text-primary-600" />
            <CardTitle>Dados do Chamado</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
                {errors.form}
              </div>
            )}

            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Notebook não liga"
              error={errors.title}
              required
              autoFocus
            />

            <div className="space-y-1">
              <label className="label">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema detalhadamente..."
                className={`input min-h-[150px] resize-y ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
                required
                rows={6}
              />
              {errors.description && (
                <p className="text-sm text-red-600" role="alert">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Categoria"
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                error={errors.category}
                required
              />

              <Select
                label="Prioridade"
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                error={errors.priority}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => navigate('/tickets')}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                <TicketPlus className="w-4 h-4 mr-2" />
                Criar Chamado
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}