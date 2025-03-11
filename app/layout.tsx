import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ChatBot } from '@/components/chat'
import { Header } from '@/components/header'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'CILU - Centre d\'Intervention Logistique Urbaine',
  description: 'Plateforme de gestion logistique urbaine pour améliorer l\'approvisionnement en eau à Kinshasa',
  keywords: 'logistique urbaine, livraison d\'eau, Kinshasa, approvisionnement en eau, CILU',
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
