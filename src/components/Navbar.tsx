
import React from 'react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed w-full bg-white z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <a href="/" className="text-xl font-semibold">CiluMarket</a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-blue-600 hover:text-blue-700">Accueil</a>
            <a href="#products" className="text-gray-600 hover:text-gray-700">Produits</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-700">Contact</a>
            <Button variant="ghost" className="text-blue-600">
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
