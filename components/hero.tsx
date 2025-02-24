import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { OrderDialog } from "@/components/order-dialog"

export function HeroSection() {
  return (
    <section className="py-12 md:py-24">
      <div className="container grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Bienvenue sur la plateforme Cilution
          </h1>
          <p className="text-gray-500 md:text-xl">
            Passez vos commandes en ligne, elles seront prise en charge par des distributeurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <OrderDialog productName="CEM II/B-LL 42,5 R" />
            <Button size="lg" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger l'application Android
            </Button>
          </div>
        </div>
        <div className="relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cilu-test.jpg-QG0nT39wvEZxvvEyRM960Pg3DHpmU7.jpeg"
            alt="CILU Logo"
            width={500}
            height={500}
            className="mx-auto"
            priority
          />
          <h2 className="text-3xl font-bold text-center text-blue-900 mt-4">MABELE YA MBOKA</h2>
        </div>
      </div>
    </section>
  )
}