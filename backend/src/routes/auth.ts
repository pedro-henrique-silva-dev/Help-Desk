import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma.js'
import { authenticate, AuthRequest, generateToken } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../utils/validators.js'

const router = Router()

router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body)

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

  const token = generateToken({ id: user.id, email: user.email, role: user.role })

  res.status(201).json({ user, token })
}))

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body)

  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user) {
    throw new AppError(401, 'Credenciais inválidas')
  }

  const validPassword = await bcrypt.compare(data.password, user.password)

  if (!validPassword) {
    throw new AppError(401, 'Credenciais inválidas')
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role })

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  })
}))

router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado')
  }

  res.json({ user })
}))

router.put('/profile', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateProfileSchema.parse(req.body)

  const existingUser = await prisma.user.findFirst({
    where: {
      email: data.email,
      NOT: { id: req.user!.id }
    }
  })

  if (existingUser) {
    throw new AppError(409, 'Email já cadastrado por outro usuário')
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name: data.name, email: data.email },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })

  res.json({ user })
}))

router.put('/password', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = changePasswordSchema.parse(req.body)

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  })

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado')
  }

  const validPassword = await bcrypt.compare(data.currentPassword, user.password)
  if (!validPassword) {
    throw new AppError(401, 'Senha atual incorreta')
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10)
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedPassword }
  })

  res.json({ message: 'Senha alterada com sucesso' })
}))

export default router