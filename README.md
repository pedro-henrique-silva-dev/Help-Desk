# Help Desk - Sistema de Gerenciamento de Chamados

Sistema completo de Help Desk para gerenciamento de chamados de suporte técnico, desenvolvido com tecnologias modernas e foco em usabilidade profissional.

## 🎯 Objetivo

Aplicação web para gerenciamento de chamados de suporte técnico, permitindo que usuários abram solicitações e que a equipe de atendimento gerencie e resolva esses chamados de forma eficiente.

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Login e cadastro de usuários
- Autenticação JWT segura
- Senhas protegidas com bcrypt
- Dois perfis de usuário:
  - **Administrador/Atendente**: Acesso total ao sistema
  - **Solicitante**: Acesso aos próprios chamados

### 📋 Gerenciamento de Chamados
- **Abertura de chamados** com título, descrição, categoria e prioridade
- **Categorias**: Hardware, Software, Rede, Sistemas, Outros
- **Prioridades**: Baixa, Média, Alta
- **Status**: Aberto, Em andamento, Concluído
- Numeração automática sequencial
- Filtros por status, categoria, prioridade e pesquisa textual
- Paginação de resultados

### 📊 Dashboard
- Cards com indicadores em tempo real:
  - Total de chamados
  - Chamados abertos
  - Chamados em andamento
  - Chamados concluídos
- Lista de chamados recentes

### 👥 Administração (Admin)
- Visualização de todos os usuários
- Criação, edição e exclusão de usuários
- Alteração de roles (Admin/Solicitante)

## 🛠 Tecnologias

### Backend
- **Node.js** + **Express** - API REST
- **TypeScript** - Tipagem estática
- **Prisma ORM** - ORM moderno para banco de dados
- **SQLite** - Banco de dados local (desenvolvimento)
- **PostgreSQL** - Banco de dados produção (Render)
- **JWT** - Autenticação stateless
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de schemas

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento SPA
- **Lucide React** - Ícones modernos

## 📁 Estrutura do Projeto

```
help-desk/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Modelos do banco de dados
│   │   ├── seed.ts            # Dados de demonstração
│   │   └── migrations/        # Migrações do banco
│   ├── src/
│   │   ├── routes/            # Rotas da API
│   │   │   ├── auth.ts        # Autenticação
│   │   │   ├── users.ts       # Usuários (admin)
│   │   │   ├── tickets.ts     # Chamados
│   │   │   └── dashboard.ts   # Estatísticas
│   │   ├── middleware/        # Middlewares
│   │   │   ├── auth.ts        # JWT auth
│   │   │   └── errorHandler.ts # Tratamento de erros
│   │   ├── utils/             # Utilitários
│   │   │   └── validators.ts  # Schemas Zod
│   │   ├── prisma.ts          # Cliente Prisma
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TicketList.tsx
│   │   │   ├── TicketDetail.tsx
│   │   │   ├── NewTicket.tsx
│   │   │   ├── Users.tsx
│   │   │   └── Settings.tsx
│   │   ├── contexts/          # React Context
│   │   │   └── AuthContext.tsx
│   │   ├── services/          # Serviços de API
│   │   │   └── api.ts
│   │   ├── types/             # Tipos TypeScript
│   │   │   └── index.ts
│   │   ├── utils/             # Utilitários
│   │   │   └── formatters.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

## 🚀 Como Executar

### 📋 Pré-requisitos
- Node.js 18+
- npm ou yarn

---

### 💻 Desenvolvimento Local

#### Backend (porta 3001)
```bash
cd backend

# Instalar dependências
npm install

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações e popular banco (SQLite local)
npm run prisma:migrate
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```
Backend local: `http://localhost:3001`

#### Frontend (porta 5173)
```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (com proxy para backend local)
npm run dev
```
Frontend local: `http://localhost:5173`

> **Nota:** Em desenvolvimento, o Vite faz proxy das requisições `/api` para `http://localhost:3001` automaticamente.

---

### ☁️ Produção (Deploy no Render)

O projeto está configurado para deploy automático no **Render** (gratuito):

| Serviço | URL de Produção |
|---------|-----------------|
| **Frontend** | https://help-desk-frontend-4j3f.onrender.com |
| **Backend API** | https://help-desk-3y9s.onrender.com |
| **Health Check** | https://help-desk-3y9s.onrender.com/api/health |

#### Variáveis de Ambiente (configuradas no painel do Render):

**Backend (Web Service):**
```env
NODE_ENV=production
DATABASE_URL=[PostgreSQL Internal URL do Render]
JWT_SECRET=[gerado automaticamente]
PORT=10000
```

**Frontend (Static Site):**
```env
VITE_API_URL=https://help-desk-3y9s.onrender.com
```

#### Banco de Dados
- **Desenvolvimento:** SQLite (`file:./dev.db`)
- **Produção:** PostgreSQL (Render Managed)

O Prisma usa `schema.prisma` (SQLite) para desenvolvimento e `schema.prod.prisma` (PostgreSQL) para produção automaticamente via script de build.

---

## 👤 Credenciais de Demonstração

Após executar o seed, as seguintes contas estarão disponíveis:

| Perfil | Email | Senha |
|--------|-------|-------|
| **Administrador** | admin@helpdesk.com | admin123 |
| **Solicitante** | user@helpdesk.com | user123 |
| **Solicitante** | maria@helpdesk.com | user123 |

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Cadastro
- `GET /api/auth/me` - Usuário atual

### Chamados
- `GET /api/tickets` - Listar (com filtros e paginação)
- `GET /api/tickets/:id` - Detalhes
- `POST /api/tickets` - Criar
- `PUT /api/tickets/:id` - Atualizar
- `DELETE /api/tickets/:id` - Excluir (admin)

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais (admin)
- `GET /api/dashboard/my-stats` - Estatísticas do usuário
- `GET /api/dashboard/recent` - Chamados recentes (admin)
- `GET /api/dashboard/my-recent` - Chamados recentes do usuário

### Usuários (Admin)
- `GET /api/users` - Listar
- `GET /api/users/:id` - Detalhes
- `PUT /api/users/:id` - Atualizar
- `DELETE /api/users/:id` - Excluir

## 🔒 Segurança

- Senhas hasheadas com bcrypt (cost 10)
- Tokens JWT com expiração de 7 dias
- Middleware de autenticação em todas as rotas privadas
- Controle de acesso baseado em roles (RBAC)
- Validação de entrada com Zod
- Proteção contra CORS configurada

## 🎨 Interface

- Design system consistente com Tailwind CSS
- Paleta de cores profissional (azul, branco, cinza)
- Componentes reutilizáveis (Button, Card, Table, Modal, etc.)
- Layout responsivo (mobile-first)
- Sidebar colapsável
- Feedback visual para loading, erros e sucesso
- Ícones Lucide React

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais e de portfólio.

---

Desenvolvido com ❤️ usando tecnologias modernas