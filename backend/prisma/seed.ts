import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@helpdesk.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@helpdesk.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@helpdesk.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'user@helpdesk.com',
      password: userPassword,
      role: 'REQUESTER'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'maria@helpdesk.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'maria@helpdesk.com',
      password: userPassword,
      role: 'REQUESTER'
    }
  })

  const tickets = [
    {
      number: 1,
      title: 'Notebook não liga',
      description: 'Meu notebook Dell não está ligando. A luz de power acende mas a tela fica preta. Já tentei retirar a bateria e segurar power por 30 segundos.',
      category: 'HARDWARE',
      priority: 'HIGH',
      status: 'OPEN',
      requesterId: user.id
    },
    {
      number: 2,
      title: 'Erro ao instalar software',
      description: 'Não consigo instalar o Adobe Creative Cloud. Aparece erro 183 durante a instalação. Windows 11 Pro.',
      category: 'SOFTWARE',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      requesterId: user.id
    },
    {
      number: 3,
      title: 'Internet lenta no setor',
      description: 'A internet está muito lenta no setor de marketing desde ontem. Testei em vários computadores e a velocidade não passa de 2Mbps.',
      category: 'NETWORK',
      priority: 'HIGH',
      status: 'OPEN',
      requesterId: user2.id
    },
    {
      number: 4,
      title: 'Sistema ERP travando',
      description: 'O sistema ERP está travando ao gerar relatórios de vendas mensais. O problema começou após a última atualização.',
      category: 'SYSTEMS',
      priority: 'MEDIUM',
      status: 'CLOSED',
      requesterId: user2.id
    },
    {
      number: 5,
      title: 'Mouse sem fio não conecta',
      description: 'Mouse Logitech MX Master 3 não conecta via Bluetooth. Já troquei as pilhas e fiz o pareamento novamente.',
      category: 'HARDWARE',
      priority: 'LOW',
      status: 'OPEN',
      requesterId: user.id
    },
    {
      number: 6,
      title: 'Acesso ao servidor de arquivos',
      description: 'Não consigo acessar a pasta compartilhada \\\\servidor\\compartilhado. Dá erro de permissão negada.',
      category: 'NETWORK',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      requesterId: user2.id
    },
    {
      number: 7,
      title: 'Impressora não imprime',
      description: 'Impressora HP LaserJet Pro M404n não imprime. Jobs ficam na fila mas não saem. Já reiniciei a impressora.',
      category: 'HARDWARE',
      priority: 'MEDIUM',
      status: 'CLOSED',
      requesterId: user.id
    },
    {
      number: 8,
      title: 'Atualização de antivírus falhou',
      description: 'O endpoint protection não atualiza há 3 dias. Mostra erro de conexão com servidor de definições.',
      category: 'SOFTWARE',
      priority: 'HIGH',
      status: 'OPEN',
      requesterId: user2.id
    }
  ]

  for (const ticket of tickets) {
    await prisma.ticket.upsert({
      where: { number: ticket.number },
      update: {},
      create: ticket
    })
  }

  console.log('✅ Seed concluído!')
  console.log('')
  console.log('📋 Credenciais de demonstração:')
  console.log('   Admin: admin@helpdesk.com / admin123')
  console.log('   User:  user@helpdesk.com / user123')
  console.log('   User:  maria@helpdesk.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })