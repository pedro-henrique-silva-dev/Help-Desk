import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['ADMIN', 'REQUESTER']).optional()
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export const createTicketSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.enum(['HARDWARE', 'SOFTWARE', 'NETWORK', 'SYSTEMS', 'OTHERS']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
})

export const updateTicketSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(['HARDWARE', 'SOFTWARE', 'NETWORK', 'SYSTEMS', 'OTHERS']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional()
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'REQUESTER']).optional()
})