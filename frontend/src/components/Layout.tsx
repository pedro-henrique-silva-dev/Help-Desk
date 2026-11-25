import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 transition-all duration-300 min-w-0">
        <div className="lg:ml-64">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900" id="page-title">
              {getPageTitle()}
            </h1>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

function getPageTitle(): string {
  const path = window.location.pathname
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/tickets': 'Meus Chamados',
    '/tickets/new': 'Novo Chamado',
    '/users': 'Usuários',
    '/settings': 'Configurações',
  }
  
  for (const [key, value] of Object.entries(titles)) {
    if (path === key || path.startsWith(key + '/')) {
      return value
    }
  }
  return 'Help Desk'
}