import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastContainer } from '@/components/Toast';
import { AuthGuard } from '@/components/AuthGuard';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'JobTracker Pro',
  description: '个人求职全链路追踪系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <ToastContainer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
