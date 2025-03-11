import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ChatBot } from '@/components/chat'
import { Header } from '@/components/header'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'CILU - Cimenterie de Lukala',
  description: 'Plateforme de commande en ligne de ciment CILU',
  keywords: 'CILU, Cimenterie de Lukala, Ciment, Congo, RDC',
  authors: [{ name: 'CILU Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        
        {children}


        <Toaster />
        <ChatBot />
        <Footer />
        
      </body>
    </html>
  )
}
