export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: 'Aberto',
    IN_PROGRESS: 'Em andamento',
    CLOSED: 'Concluído',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'badge-primary',
    IN_PROGRESS: 'badge-warning',
    CLOSED: 'badge-success',
  }
  return colors[status] || 'badge-gray'
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
  }
  return labels[priority] || priority
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'badge-success',
    MEDIUM: 'badge-warning',
    HIGH: 'badge-danger',
  }
  return colors[priority] || 'badge-gray'
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    HARDWARE: 'Hardware',
    SOFTWARE: 'Software',
    NETWORK: 'Rede',
    SYSTEMS: 'Sistemas',
    OTHERS: 'Outros',
  }
  return labels[category] || category
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    REQUESTER: 'Solicitante',
  }
  return labels[role] || role
}