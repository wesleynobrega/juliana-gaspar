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
          {/* Spacer compensates exact header height */}
          <div className="w-full" style={{ height: '5rem' }} />
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 px-4 pb-6 md:px-6 md:pb-8 lg:px-8 lg:pb-10">
              {children}
            </main>
          </div>
          <Toaster position="top-right" richColors closeButton />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
