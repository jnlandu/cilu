
import { Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-white pt-20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Bienvenue sur la plateforme Cilution
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Passez vos commandes en ligne, elles seront prises en charge par des distributeurs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="btn-primary w-full sm:w-auto" size="lg">
              Commander
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Download className="mr-2 h-5 w-5" />
              Télécharger l'application Android
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
