import { Router, Request, Response } from 'express'
import { prisma } from '../prisma.js'
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { createTicketSchema, updateTicketSchema } from '../utils/validators.js'

const router = Router()

const getTicketWhere = (user: AuthRequest['user'], query: any) => {
  const where: any = {}

  if (user?.role !== 'ADMIN') {
    where.requesterId = user!.id
  }

  if (query.status) {
    where.status = query.status
  }

  if (query.category) {
    where.category = query.category
  }

  if (query.priority) {
    where.priority = query.priority
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  return where
}

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const where = getTicketWhere(req.user, req.query)

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        requester: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.ticket.count({ where })
  ])

  res.json({
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}))

router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: req.params.id },
    include: {
      requester: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  if (!ticket) {
    throw new AppError(404, 'Chamado não encontrado')
  }

  if (req.user!.role !== 'ADMIN' && ticket.requesterId !== req.user!.id) {
    throw new AppError(403, 'Acesso negado')
  }

  res.json({ ticket })
}))

router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createTicketSchema.parse(req.body)

  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { number: 'desc' },
    select: { number: true }
  })

  const nextNumber = (lastTicket?.number || 0) + 1

  const ticket = await prisma.ticket.create({
    data: {
      ...data,
      number: nextNumber,
      requesterId: req.user!.id
    },
    include: {
      requester: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  res.status(201).json({ ticket })
}))

router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateTicketSchema.parse(req.body)

  const ticket = await prisma.ticket.findUnique({
    where: { id: req.params.id }
  })

  if (!ticket) {
    throw new AppError(404, 'Chamado não encontrado')
  }

  if (req.user!.role !== 'ADMIN') {
    if (ticket.requesterId !== req.user!.id) {
      throw new AppError(403, 'Acesso negado')
    }
    delete data.status
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: req.params.id },
    data,
    include: {
      requester: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  res.json({ ticket: updatedTicket })
}))

router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.ticket.delete({
    where: { id: req.params.id }
  })

  res.status(204).send()
}))

export default router