'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Users, CreditCard,
  RefreshCw, Truck, Menu, ChefHat, ChevronLeft
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/catalogo', label: 'Catalogo', icon: UtensilsCrossed },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { href: '/ciclos', label: 'Ciclos', icon: RefreshCw },
  { href: '/entregas', label: 'Entregas', icon: Truck },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {NAV_ITEMS.map(item => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
              isActive
                ? 'bg-primary-100 text-primary-900'
                : 'text-primary-600 hover:bg-primary-50 hover:text-primary-800'
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile: Sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden fixed top-3 left-3 z-50">
              <Menu className="w-5 h-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-64 p-4 bg-cream">
          <div className="flex items-center gap-2 mb-8 pt-2">
            <ChefHat className="w-6 h-6 text-primary-700" />
            <span className="font-display text-lg font-bold text-primary-900">Juliana Gaspar</span>
          </div>
          <NavLinks onClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop: Fixed sidebar */}
      <aside className={cn(
        'hidden lg:block sticky top-16 h-[calc(100vh-4rem)] bg-cream border-r border-primary-100 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-6 px-2 pt-3">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary-700" />
                <span className="font-display font-bold text-primary-900 text-sm">Menu</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-auto"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
            </Button>
          </div>
          <NavLinks />
        </div>
      </aside>
    </>
  );
}
