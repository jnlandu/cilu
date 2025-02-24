'use client'

import { useEffect, useState } from "react"
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
import { CreditCard, Smartphone } from "lucide-react"
import { PRODUCTS } from "@/data/sites"



// Update the PaymentDetails interface
interface PaymentDetails {
  bank?: {
    accountNumber: string;
    bankName: string;
  };
  mobile?: {
    phoneNumber: string;
    operator: string;
  };
}

interface PaymentPageProps {
  params: {
    id: string
    orderId: string
  }
}

interface PendingOrder {
  id: string
  product: string
  quantity: number
  amount: number
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({})
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'mobile' | null>(null)
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null)

  useEffect(() => {
    const orderData = sessionStorage.getItem('pendingOrder')
    if (!orderData) {
      router.push(`/dashboard/users/${params.id}`)
      return
    }
    setPendingOrder(JSON.parse(orderData))
  }, [params.id, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${params.id}/payments/${params.orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pendingOrder,
          paymentMethod,
          accountDetails: paymentDetails[paymentMethod as keyof PaymentDetails],
          userId: params.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process payment')
      }

      sessionStorage.removeItem('pendingOrder')
      toast({
        title: "Paiement réussi",
        description: "Votre commande a été confirmée"
      })
      router.push(`/dashboard/users/${params.id}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le paiement a échoué"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!pendingOrder) return null

  const isFormValid = () => {
    if (paymentMethod === 'bank') {
      return paymentDetails.bank?.accountNumber && paymentDetails.bank?.bankName;
    }
    if (paymentMethod === 'mobile') {
      return paymentDetails.mobile?.phoneNumber && paymentDetails.mobile?.operator;
    }
    return false;
  };

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
          <CardTitle>Paiement de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Résumé de la commande</h3>
            <p>Produit: {PRODUCTS.find(p => p.id === pendingOrder.product)?.name}</p>
            <p>Quantité: {pendingOrder.quantity} sacs</p>
            <p className="text-lg font-bold mt-2">Total: {pendingOrder.amount} FC</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                className="h-24"
                onClick={() => setPaymentMethod('bank')}
              >
                <div className="space-y-2">
                  <CreditCard className="h-6 w-6 mx-auto" />
                  <div>Compte Bancaire</div>
                </div>
              </Button>

              <Button
                type="button"
                variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                className="h-24"
                onClick={() => setPaymentMethod('mobile')}
              >
                <div className="space-y-2">
                  <Smartphone className="h-6 w-6 mx-auto" />
                  <div>Mobile Money</div>
                </div>
              </Button>
            </div>

            {paymentMethod === 'bank' && (
              <div className="space-y-4">
                <div>
                  <Label>Numéro de compte</Label>
                  <Input 
                    placeholder="Entrer votre numéro de compte"
                    onChange={(e) => setPaymentDetails(prev => ({
                      ...prev,
                      bank: {
                        accountNumber: e.target.value,
                        bankName: prev.bank?.bankName || ''
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Nom de la banque</Label>
                  <Select onValueChange={(value) => setPaymentDetails(prev => ({
                    ...prev,
                    bank: {
                      accountNumber: prev.bank?.accountNumber || '',
                      bankName: value
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner votre banque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rawbank">Rawbank</SelectItem>
                      <SelectItem value="equity">Equity Bank</SelectItem>
                      <SelectItem value="tmb">Trust Merchant Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {paymentMethod === 'mobile' && (
              <div className="space-y-4">
                <div>
                  <Label>Numéro de téléphone</Label>
                  <Input 
                    placeholder="Ex: +243 XX XXX XXXX"
                    onChange={(e) => setPaymentDetails(prev => ({
                      ...prev,
                      mobile: {
                        phoneNumber: e.target.value,
                        operator: prev.mobile?.operator || ''
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Opérateur</Label>
                  <Select onValueChange={(value) => setPaymentDetails(prev => ({
                    ...prev,
                    mobile: {
                      phoneNumber: prev.mobile?.phoneNumber || '',
                      operator: value
                    }
                  }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'opérateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="orange">Orange Money</SelectItem>
                      <SelectItem value="airtel">Airtel Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !paymentMethod || !isFormValid()}
            >
              {isLoading ? "Traitement..." : "Confirmer le paiement"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}