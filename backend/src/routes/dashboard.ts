import { Router, Request, Response } from 'express'
import { prisma } from '../prisma.js'
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()

router.get('/stats', authenticate, requireAdmin, asyncHandler(async (_req: Request, res: Response) => {
  const [total, open, inProgress, closed] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'OPEN' } }),
    prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.ticket.count({ where: { status: 'CLOSED' } })
  ])

  res.json({
    stats: {
      total,
      open,
      inProgress,
      closed
    }
  })
}))

router.get('/my-stats', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const [total, open, inProgress, closed] = await Promise.all([
    prisma.ticket.count({ where: { requesterId: req.user!.id } }),
    prisma.ticket.count({ where: { requesterId: req.user!.id, status: 'OPEN' } }),
    prisma.ticket.count({ where: { requesterId: req.user!.id, status: 'IN_PROGRESS' } }),
    prisma.ticket.count({ where: { requesterId: req.user!.id, status: 'CLOSED' } })
  ])

  res.json({
    stats: {
      total,
      open,
      inProgress,
      closed
    }
  })
}))

router.get('/recent', authenticate, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const tickets = await prisma.ticket.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      requester: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  res.json({ tickets })
}))

router.get('/my-recent', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const tickets = await prisma.ticket.findMany({
    where: { requesterId: req.user!.id },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      requester: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  res.json({ tickets })
}))

export default router