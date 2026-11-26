import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma.js'
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { createUserSchema, updateUserSchema } from '../utils/validators.js'

const router = Router()

router.get('/', authenticate, requireAdmin, asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json({ users })
}))

router.get('/:id', authenticate, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado')
  }

  res.json({ user })
}))

router.post('/', authenticate, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createUserSchema.parse(req.body)

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new AppError(409, 'Email já cadastrado')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'REQUESTER'
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  res.status(201).json({ user })
}))

router.put('/:id', authenticate, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateUserSchema.parse(req.body)

  const existing = await prisma.user.findUnique({
    where: { id: req.params.id }
  })

  if (!existing) {
    throw new AppError(404, 'Usuário não encontrado')
  }

  const updateData: { name?: string; email?: string; password?: string; role?: string } = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.role !== undefined) updateData.role = data.role
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  res.json({ user })
}))

router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.params.id === req.user!.id) {
    throw new AppError(400, 'Não é possível excluir seu próprio usuário')
  }

  const existing = await prisma.user.findUnique({
    where: { id: req.params.id }
  })

  if (!existing) {
    throw new AppError(404, 'Usuário não encontrado')
  }

  const ticketCount = await prisma.ticket.count({
    where: { requesterId: req.params.id }
  })

  if (ticketCount > 0) {
    throw new AppError(400, 'Não é possível excluir usuário com chamados vinculados')
  }

  await prisma.user.delete({
    where: { id: req.params.id }
  })

  res.status(204).send()
}))

export default router