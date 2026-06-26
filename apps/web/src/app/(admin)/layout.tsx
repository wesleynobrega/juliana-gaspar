import { AuthProvider } from '@/lib/auth-context';
import { AuthGuard } from '@/components/admin/auth-guard';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="min-h-screen bg-cream-50">
          <AdminHeader />
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-4 md:p-6 lg:p-8 pt-24 min-h-screen">
              {children}
            </main>
          </div>
          <Toaster position="top-right" richColors closeButton />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
