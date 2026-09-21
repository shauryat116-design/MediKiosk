'use client';

import React, { useEffect } from 'react';
import './globals.css';
import '@/lib/i18n';
import { Header } from '@/components/shared/Header';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AccessibilityMenu } from '@/components/shared/AccessibilityMenu';
import { useUIStore } from '@/lib/stores/uiStore';
import { useSessionStore } from '@/lib/stores/sessionStore';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { highContrast, fontSize } = useUIStore();
  const { initSession, sessionId } = useSessionStore();

  useEffect(() => {
    if (!sessionId) {
      initSession();
    }
  }, [sessionId, initSession]);

  // Kiosk right-click & context menu disable
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const getFontSizeStyle = () => {
    if (fontSize === 'large') return { fontSize: '120%' };
    if (fontSize === 'xlarge') return { fontSize: '140%' };
    return {};
  };

  return (
    <html lang="en" className={highContrast ? 'high-contrast' : ''} style={getFontSizeStyle()}>
      <body className="min-h-screen flex flex-col bg-slate-50 antialiased selection:bg-none">
        <ErrorBoundary>
          <Header />
          <main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
          <AccessibilityMenu />
        </ErrorBoundary>
      </body>
    </html>
  );
}
