'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  Truck, 
  Clock, 
  ShoppingCart, 
  Calendar,
  CheckCircle2
} from "lucide-react"
import { User } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Order {
  id: string
  product: string
  quantity: number
  status: 'pending' | 'delivered' | 'processing'
  date: string
}

interface PaymentPageProps {
    params: {
      id: string
      orderId: string
    }
  }

export default function UserDashboard({ params }: PaymentPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const [userResponse, ordersResponse] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/users/${params.id}/orders`)
        ])

        if (!userResponse.ok || !ordersResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const { user } = await userResponse.json()
        const { orders } = await ordersResponse.json()
        
        setUser(user)
        setOrders(orders)
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Erreur lors du chargement des données"
        })
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [params.id, router, toast])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Bienvenue, {user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <Button 
          onClick={() => router.push(`/dashboard/users/${params.id}/orders`)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nouvelle Commande
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-gray-500">Depuis votre inscription</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-gray-500">Commandes en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Livrées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
            <p className="text-xs text-gray-500">Commandes complétées</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'delivered' ? 'Livré' :
                       order.status === 'pending' ? 'En attente' : 'En cours'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}