'use client';
import { useRouter } from 'next/navigation';
// Fix: Import ReactNode from React to correctly type component children.
import { useEffect, ReactNode } from 'react';
import { Sidebar } from './_components/Sidebar';
import { Header } from './_components/Header';
import { DashboardStateProvider } from '@/hooks/useDashboardState';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardStateProvider>
      <SidebarProvider>
        <div className="bg-background min-h-screen text-text-primary font-sans flex">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen lg:pl-72">
                <Header />
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                     {children}
                </div>
            </main>
        </div>
      </SidebarProvider>
    </DashboardStateProvider>
  );
}
