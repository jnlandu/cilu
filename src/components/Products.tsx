
import React from 'react';

const Products = () => {
  return (
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-center mb-6">NOS PRODUITS</h2>
        
        <p className="text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Grâce à son usine modernisée, son personnel qualifié et ses standards internationaux, la CILU met sur le marché Congolais les produits ci-après :
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img 
              src="/lovable-uploads/16cd4dfa-16e7-403e-b3c5-b76c9356f234.png"
              alt="CEM II/B-LL 42,5 R" 
              className="w-full h-auto max-w-lg mx-auto"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">
              CEM II/B-LL 42,5 R
            </h3>

            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Il satisfait aux exigences de la norme EN 197-1 F 2011</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Ciment à haute résistance et à prise rapide, destiné aux travaux de bâtiment et de Génie Civil nécessitant de fortes résistances à court terme.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Ciment à teneur limitée en sulfures pour bétons précontraints</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Excellente ouvrabilité et facilité de mise en œuvre des bétons et shapes, techniquement approprié pour la fabrication des blocs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
