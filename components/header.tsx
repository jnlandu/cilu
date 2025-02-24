'use client'
import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">CiluMarket</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-blue-600">
            Accueil
          </Link>
          <Link href="#produits" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Produits
          </Link>
          <Link href="#contact" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Contact
          </Link>
          <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Se connecter
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link 
              href="/" 
              className="block text-sm font-medium text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              href="#produits" 
              className="block text-sm font-medium text-gray-500 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Produits
            </Link>
            <Link 
              href="#contact" 
              className="block text-sm font-medium text-gray-500 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              href="/auth/login" 
              className="block text-sm font-medium text-gray-500 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Se connecter
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}