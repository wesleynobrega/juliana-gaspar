'use client';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const BREADCRUMB_MAP: Record<string, string> = {
  'painel': 'Dashboard',
  'catalogo': 'Catalogo',
  'pedidos': 'Pedidos',
  'clientes': 'Clientes',
  'pagamentos': 'Pagamentos',
  'ciclos': 'Ciclos',
  'entregas': 'Entregas',
  'ingredientes': 'Ingredientes',
  'receitas': 'Receitas',
  'assinaturas': 'Assinaturas',
};

function getBreadcrumb(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  return segments.map(s => BREADCRUMB_MAP[s] || s).join(' > ');
}

export function AdminHeader() {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-cream/95 backdrop-blur border-b border-primary-100 flex items-center justify-between px-4 lg:px-6">
      <div>
        <span className="text-xs text-primary-400 uppercase tracking-wider">Admin</span>
        <h1 className="font-display text-lg font-bold text-primary-900 leading-tight">{breadcrumb}</h1>
      </div>

      <div className="flex items-center gap-3">
        <img
          src="/imagemhero.png"
          alt="Juliana Gaspar"
          className="h-11 w-auto object-contain hidden sm:block"
        />

        <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary-200 text-primary-700 text-sm font-medium">JG</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-sm">
            <User className="w-4 h-4 mr-2" /> Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className="text-sm text-red-600" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
