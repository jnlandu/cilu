import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { OrderDialog } from "@/components/order-dialog"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero"
// import { OrderDialog } from "@/components/order-dialog"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col p-8">
      <main className="flex-1">
        <HeroSection />
        {/* About Section */}
        <section className="py-12 md:py-24 bg-gray-50">
          <div className="container space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl" id="produits">NOS PRODUITS</h2>
              <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl">
                Grâce à son usine modernisée, son personnel qualifié et ses standards internationaux, la CILU met sur le
                marché Congolais les produits ci-après :
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cilu-2-test.jpg-b8XEWZ9005tQX6cIEa5eYgsU8yYovx.jpeg"
                alt="CEM II/B-LL 42,5 R"
                width={500}
                height={500}
                className="mx-auto"
              />
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">CEM II/B-LL 42,5 R</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Il satisfait aux exigences de la norme EN 197-1 F 2011</li>
                  <li>
                    • Ciment à haute résistance et à prise rapide, destiné aux travaux de bâtiment et de Génie Civil
                    nécessitant de fortes résistances à court terme.
                  </li>
                  <li>• Ciment à teneur limitée en sulfures pour bétons précontraints</li>
                  <li>
                    • Excellente ouvrabilité et facilité de mise en œuvre des bétons et shapes, techniquement approprié
                    pour la fabrication des blocs
                  </li>
                </ul>
                <OrderDialog productName="CEM II/B-LL 42,5 R" />
              </div>
            </div>

            {/* Second Product Section */}
            <div className="grid gap-8 md:grid-cols-2 items-center mt-16">
              <div className="space-y-4 order-2 md:order-1">
                <h3 className="text-2xl font-bold">CEM II/B-LL 32,5 R</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• IL satisfait aux exigences de la norme EN 197-1 F 2011</li>
                  <li>• Destine aux application a usage general avec une bonne resistance a moyenne echeance</li>
                  <li>
                    • Ciment a prise rapide avec une excellente ouvrabilite et une facilite de mise en oeuvre des betons
                  </li>
                </ul>
                <OrderDialog productName="CEM II/B-LL 32,5 R" />
              </div>
              <div className="order-1 md:order-2">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cilu-3-test.jpg-WFgAica7mFejlaRG38Qmzpf2uiVuuZ.jpeg"
                  alt="CEM II/B-LL 32,5 R"
                  width={500}
                  height={500}
                  className="mx-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Ce que nous produisons Section */}
        <section className="py-12 md:py-24 bg-white">
          <div className="container space-y-12">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">Ce que nous produisons.</h2>
              <p className="text-gray-600">
                Roche de qualité et savoir-faire sont le reflet de notre professionnalisme. Partout en RDC, la CILU a
                toujours su offrir un ciment de bonne qualité pour construire aussi bien des petites maisons que de
                prestigieux monuments.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid md:grid-cols-[200px,1fr] gap-6 items-center">
                <Image src="/placeholder.svg" alt="Ciments Portland" width={200} height={200} className="mx-auto" />
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Ciments Portland</h3>
                  <p className="text-gray-600">
                    Les ciments Portland sont des liants hydrauliques composés principalement de silicates de calcium
                    hydrauliques qui font prises et durcissent en vertu d'une réaction chimique à l'eau appelée
                    hydratation. Lorsqu'on ajoute la pâte (ciment, air et eau) aux granulats (sable et gravier, pierre
                    concassée ou autre matériau granulaire), elle agit...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
               {/* Contact Section */}
               <section className="py-12 md:py-24 bg-gray-50" id="contact">
          <div className="container space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contact</h2>
              <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl">
                Pour toute question ou demande d'information, n'hésitez pas à nous contacter.
              </p>
            </div>
            <form className="max-w-[600px] mx-auto space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="text-center">
                <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Envoyer
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>
      
    </div>
  )
}

