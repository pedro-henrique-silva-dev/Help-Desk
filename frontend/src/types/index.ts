export type Role = 'ADMIN' | 'REQUESTER'

export type Category = 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'SYSTEMS' | 'OTHERS'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export type Status = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface Ticket {
  id: string
  number: number
  title: string
  description: string
  category: Category
  priority: Priority
  status: Status
  requesterId: string
  requester: User
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TicketsResponse {
  tickets: Ticket[]
  pagination: Pagination
}

export interface DashboardStats {
  total: number
  open: number
  inProgress: number
  closed: number
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: Role
}

export interface CreateTicketData {
  title: string
  description: string
  category: Category
  priority: Priority
}

export interface UpdateTicketData {
  title?: string
  description?: string
  category?: Category
  priority?: Priority
  status?: Status
}