
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <img src="/logo-placeholder.svg" alt="CiluMarket" className="h-12 w-auto" />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="nav-link">Accueil</a>
            <a href="#products" className="nav-link">Produits</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Button variant="outline" className="ml-4">
              Se connecter
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-4">
            <a href="#" className="block nav-link py-2">Accueil</a>
            <a href="#products" className="block nav-link py-2">Produits</a>
            <a href="#contact" className="block nav-link py-2">Contact</a>
            <Button variant="outline" className="w-full">
              Se connecter
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
