
import React from 'react';

const Products = () => {
  return (
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-center mb-6">NOS PRODUITS</h2>
        
        <p className="text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Grâce à son usine modernisée, son personnel qualifié et ses standards internationaux, la CILU met sur le marché Congolais les produits ci-après :
        </p>

        {/* First Product */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
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

        {/* Second Product */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 md:order-1 space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">
              CEM II/B-LL 32,5 R
            </h3>

            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>IL satisfait aux exigences de la norme EN 197-1 F 2011</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Destine aux application a usage general avec une bonne resistance a moyenne echeance</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Ciment a prise rapide avec une excellente ouvrabilite et une facilite de mise en oeuvre des betons</span>
              </li>
            </ul>
          </div>

          <div className="order-1 md:order-2 relative">
            <img 
              src="/lovable-uploads/23d9a48d-d6fe-42d2-ab58-0eb14cbb9df2.png"
              alt="CEM II/B-LL 32,5 R" 
              className="w-full h-auto max-w-lg mx-auto"
            />
          </div>
        </div>

        {/* Ce que nous produisons section */}
        <div className="bg-gray-50 rounded-xl p-8 md:p-12 relative overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ce que nous produisons.</h2>
            
            <p className="text-gray-600 mb-12">
              Roche de qualité et savoir-faire sont le reflet de notre professionnalisme. Partout en RDC, la CILU a toujours su offrir un ciment de bonne qualité pour construire aussi bien des petites maisons que de prestigieux monuments.
            </p>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <img 
                  src="/lovable-uploads/23d9a48d-d6fe-42d2-ab58-0eb14cbb9df2.png"
                  alt="Ciments Portland" 
                  className="w-32 h-auto"
                />
                <div>
                  <h3 className="text-xl font-bold mb-3">Ciments Portland</h3>
                  <p className="text-gray-600">
                    Les ciments Portland sont des liants hydrauliques composés principalement de silicates de calcium hydrauliques qui font prises et durcissent en vertu d'une réaction chimique à l'eau appelée hydratation. Lorsqu'on ajoute la pâte (ciment, air et eau) aux granulats (sable et gravier, pierre concassée ou autre matériau granulaire), elle agit...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -left-4 top-1/4 opacity-5">
            <div className="w-8 h-8 bg-primary transform rotate-45" />
          </div>
          <div className="absolute -right-4 bottom-1/4 opacity-5">
            <div className="w-12 h-12 bg-primary transform rotate-45" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
