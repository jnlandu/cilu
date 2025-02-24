'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PRODUCTS = [
  { id: "cem-42-5", name: "CEM II/B-LL 42,5 R", description: "Ciment à haute résistance" },
  { id: "cem-32-5", name: "CEM II/B-LL 32,5 R", description: "Ciment à usage général" },
]

export default function OrderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: formData.product,
          quantity: parseInt(formData.quantity),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      toast({
        title: "Commande créée",
        description: "Votre commande a été enregistrée avec succès",
      })
      
      router.push('/dashboard')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la commande",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        ← Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Commande</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product">Produit</Label>
              <Select
                value={formData.product}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, product: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité (en sacs)</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, quantity: e.target.value }))
                }
                placeholder="Entrer la quantité"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !formData.product || !formData.quantity}
            >
              {isLoading ? "Création en cours..." : "Créer la commande"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}