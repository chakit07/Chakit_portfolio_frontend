import '@/styles/globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import AIChatbot from '@/components/public/AIChatbot';
import { ToastProvider } from '@/components/ui/Toast';
import dynamic from 'next/dynamic';

const BackgroundCanvas = dynamic(() => import('@/components/public/BackgroundCanvas'), { ssr: false });

export const metadata = {
  title: 'Chakit Sharma — Full-Stack Developer & UI/UX Specialist',
  description: 'Portfolio of Chakit Sharma featuring full-stack engineering, interactive 3D web experiences, distributed systems, and modern UI/UX design.',
  keywords: ['Full-Stack Developer', 'Next.js', 'React', 'Node.js', 'Express', 'MongoDB', 'Three.js'],
  authors: [{ name: 'Chakit Sharma' }],
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen text-foreground selection:bg-primary/20 selection:text-primary">
        {/* Animated background canvas — fixed, behind all content */}
        <BackgroundCanvas />
        <ThemeProvider defaultTheme="dark" defaultAccent="#3b82f6">
          <ToastProvider>
            <div style={{ position: 'relative', zIndex: 1 }}>
              {children}
              <AIChatbot />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
