import Link from "next/link"

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">CiluMarket</span>
        </Link>
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
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Se connecter
          </Link>
        </nav>
      </div>
    </header>
  )
}