import Link from 'next/link'
import React from 'react'

export default function Footer (){
  return (
    <div>
        <footer className="border-t py-6">
        <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">CiluMarket © 2024. Tous droits réservés.</p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Condition d'utilisation
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Contrat des prestations
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
              Contrat des distributeurs
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

