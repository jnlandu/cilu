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
import axios from "axios"



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
  const [formData, setFormData] = useState({
    orderNumber: '',
    phone: ''
  })
  const isValidPhone = (phone: string) => {
    return /^243[0-9]{9}$/.test(phone)
  }

  const extractReferenceNumber = (orderNumber: string) => {
    const phoneStartIndex = orderNumber.indexOf('243')
    
    if (phoneStartIndex === -1) {
      return {
        reference: orderNumber,
        phoneNumber: ''
      }
    }

  
    const reference = orderNumber.substring(0, phoneStartIndex)
    const phoneNumber = orderNumber.substring(phoneStartIndex)
  
    return {
      reference,
      phoneNumber
    }
  }

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
    if (!isValidPhone(formData.phone)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Numéro de téléphone invalide"
      })
      return
    }
    setIsLoading(true)
  
    try {
      const data = {
        Numero: formData.phone,
        Montant:  pendingOrder?.amount,
        currency: 'CDF',
        description: 'Paiement de publication',
      }
      const gateway = `${process.env.NEXT_PUBLIC_FASTAPI_URL}/payment`
      const headers = {
        'Content-Type': 'application/json',
        "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJcL2xvZ2luIiwicm9sZXMiOlsiTUVSQ0hBTlQiXSwiZXhwIjoxNzc5OTcwMTc1LCJzdWIiOiJlNzFiM2I4ZDMyNGFmYTMwOWU0NzY4MGI1ZjE0NDhhNCJ9.cLawA7kXCwBNYADRdwy9BJKwxQJOjUf0nTQ1i2Wipnw",
        'Access-Control-Allow-Origin': '*'
      } 
      // Call the backend API directly
      const response = await axios.post(gateway, data, { headers, timeout: 60000 })
      const responseData = response.data
      const orderNumber = responseData.orderNumber
      
      if (!orderNumber) {
        throw new Error('Payment processing failed')
      }
    const { reference, phoneNumber } = extractReferenceNumber(orderNumber)
    await checkPayment(reference, phoneNumber, orderNumber)
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Le paiement a échoué"
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!pendingOrder) return null


const checkPayment = async (reference: string, phoneNumber: string, orderNumber: string) => {

    const maxAttempts = 20;
    let attempts = 0;

    const pollStatus = async () => {
        if (attempts >= maxAttempts) {
          toast({
            variant: "destructive",
            title: "Délai dépassé",
            description: "La confirmation du paiement a pris trop de temps"
          });
          return;
        }

        try{
          const gateway = `${process.env.NEXT_PUBLIC_FASTAPI_URL}/check-payment/${orderNumber}`;
          const response = await axios.get(gateway );
          const { verification, message } = response.data;

          console.log("Debugging verification: ", verification, message)

          switch (verification) {
            case '0':
              await updatePaymentStatus(reference, phoneNumber, true);
              toast({
                title: "Succès",
                description: message || "Paiement confirmé!",
                duration: 5000
              });

              sessionStorage.removeItem('pendingOrder')
              router.push(`/dashboard/users/${params.id}`)

              break;
              case '1':
                updatePaymentStatus(reference, phoneNumber, false);
                toast({
                  variant: "destructive",
                  title: "Erreur",
                  description: message || "Le paiement a échoué",
                  duration: 5000
                });
                break;

            case '2':
               attempts++;
                toast({
                  title: "En attente",
                  description: "Votre paiement est en cours de traitement",
                });
                 // Wait 3 seconds before trying again
                setTimeout(pollStatus, 3000);
               
              break;
            default:
              throw new Error('Invalid verification status');
          }
        }catch(error){
          attempts++;
          if (attempts >= maxAttempts) {
            toast({
              variant: "destructive",
              title: "Délai dépassé",
              description: "La confirmation du paiement a pris trop de temps"
            });
            return;
          }
        }
    }
    await pollStatus();
}

const updatePaymentStatus = async (reference: string, phoneNumber: string, status: boolean) => {
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
        reference: reference,
        orderNumber: phoneNumber,
        status: status ? 'payé' : 'échec'
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to process payment')
    }

    if ( status){
      toast({
        title: "Succès",
        description: "Paiement confirmé"
      })
    }else{
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le paiement a échoué"
    })
    }
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
                    type="telephone"
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
                    placeholder="Ex: 243 XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e: any) => {
                      const input = e.target.value
                      const cleaned = input.replace(/\D/g, '')
                      if (cleaned.length <= 12 && (cleaned.startsWith('243') || cleaned.length <= 3)) {
                        setFormData(prev => ({
                          ...prev,
                          phone: cleaned
                        }))
                      }
                      setPaymentDetails(prev => ({
                        ...prev,      
                        mobile: {
                          phoneNumber: cleaned,
                          operator: prev.mobile?.operator || ''
                        }
                      }))
                    }}
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
              disabled={isLoading || !paymentMethod }
            >
              {isLoading ? "Traitement..." : "Confirmer le paiement"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}