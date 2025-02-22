
import { Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-gray-900">
              Bienvenue sur la plateforme Cilution
            </h1>
            <p className="text-xl text-gray-600">
              Passez vos commandes en ligne, elles seront prise en charge par des distributeurs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gray-100 hover:bg-gray-200 text-gray-900"
                size="lg"
              >
                Commander
              </Button>
              <Button 
                variant="default"
                size="lg"
                className="bg-blue-700 hover:bg-blue-800"
              >
                <Download className="mr-2 h-5 w-5" />
                Télécharger l'application Andoid
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-md border-2 border-[#1e3c8a] rounded-lg p-4">
              <img 
                src={'/lovable-uploads/514d91e7-a2ef-483a-9fc7-1566328c7c50.png'} 
                alt="CILU Logo" 
                className="w-full h-auto"
              />
            </div>
            <h2 className="text-4xl font-bold text-[#1e3c8a] uppercase tracking-wider">
              Mabele Ya Mboka
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
