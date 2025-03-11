'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  Truck, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle2,
  UserIcon,
  Search,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Store
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"

// Add these imports at the top
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Add this schema inside the component, before the component function starts
const userEditSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  street: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  province: z.string().min(2, "La province doit contenir au moins 2 caractères"),
  depot: z.string().min(2, "Le nom du dépôt est requis"),
})

interface Order {
  id: string
  userId: string
  userName: string
  product: string
  quantity: number
  amount: number
  status: 'pending' | 'processing' | 'delivered'
  date: string
  address: {
    street: string
    city: string
    phone: string
  }
}

interface User {
  id: string
  name: string
  email: string
  street: string
  city: string
  province: string
  phone: string
  depot: string
  role: 'user' | 'admin'
  createdAt: string
}

interface DashboardStats {
  totalOrders: number
  activeDeliveries: number
  totalCustomers: number
  totalRevenue: number
}

interface Admin {
  id: string
  name: string
  email: string
  role: 'admin'
}

export default function AdminDashboard({ params }: { params: { id: string } }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeDeliveries: 0,
    totalCustomers: 0,
    totalRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState("orders")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [userOrders, setUserOrders] = useState<Order[]>([])


  const form = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      province: "",
      depot: "",
    },
  })

  const openEditDialog = (user: User) => {
    form.reset({
      name: user.name,
      email: user.email,
      phone: user.phone,
      street: user.street,
      city: user.city,
      province: user.province,
      depot: user.depot,
    })
    setIsEditDialogOpen(true)
  }

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [adminResponse, statsResponse, ordersResponse, usersResponse] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/admin/${params.id}/stats`),
          fetch(`/api/admin/${params.id}/orders`),
          fetch(`/api/admin/${params.id}/users`)
        ])

        if (!adminResponse.ok || !statsResponse.ok || !ordersResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const { user: adminData } = await adminResponse.json()
        const { stats } = await statsResponse.json()
        const { orders } = await ordersResponse.json()
        const { users } = await usersResponse.json()

        setAdmin(adminData)
        setStats(stats)
        setRecentOrders(orders)
        setUsers(users.filter((user: User) => user.role !== 'admin'))
        
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [params.id, toast])

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update order')

      setRecentOrders(orders =>
        orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      toast({
        title: "Succès",
        description: "Statut de la commande mis à jour"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut"
      })
    }
  }

  const viewUserDetails = async (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
    
    // Fetch user orders
    try {
      const response = await fetch(`/api/admin/${params.id}/users/${user.id}/orders`)
      if (response.ok) {
        const { orders } = await response.json()
        setUserOrders(orders)
      } else {
        setUserOrders([])
      }
    } catch (error) {
      console.error("Error fetching user orders:", error)
      setUserOrders([])
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

// Add this function to handle form submission
const onSubmit = async (values: z.infer<typeof userEditSchema>) => {
  if (!selectedUser) return
  
  setIsUpdating(true)
  try {
    const response = await fetch(`/api/admin/${params.id}/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })

    if (!response.ok) throw new Error('Failed to update user')

    const { user: updatedUser } = await response.json()
    
    // Update the user in the users list
    setUsers(users.map(user => 
      user.id === selectedUser.id ? { ...user, ...values } : user
    ))
    
    // Update the selected user
    setSelectedUser({ ...selectedUser, ...values })
    
    setIsEditDialogOpen(false)
    toast({
      title: "Succès",
      description: "Les informations du client ont été mises à jour"
    })
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de mettre à jour les informations du client"
    })
  } finally {
    setIsUpdating(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
       <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Tableau de bord administrateur</h1>
              <p className="text-gray-500">Gérez vos commandes et clients</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{admin?.name || "Non defini"}</p>
              <p className="text-sm text-gray-500">{admin?.email || 'Non defini'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-gray-500">Toutes les commandes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">En Cours</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
              <p className="text-xs text-gray-500">Livraisons en cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-gray-500">Clients actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FC</div>
              <p className="text-xs text-gray-500">Total des ventes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Commandes Récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>{order.userName}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{order.address.street}</p>
                              <p className="text-gray-500">{order.address.city}</p>
                            </div>
                          </TableCell>
                          <TableCell>{order.address.phone}</TableCell>
                          <TableCell>{order.product}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.amount.toLocaleString()} FC</TableCell>
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
                          <TableCell>
                            <div className="flex gap-2">
                              {order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'processing')}
                                >
                                  Traiter
                                </Button>
                              )}
                              {order.status === 'processing' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                                >
                                  Marquer livré
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Utilisateurs</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>Dépôt</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>{user.city}</TableCell>
                            <TableCell>{user.province}</TableCell>
                            <TableCell>{user.depot}</TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                onClick={() => openEditDialog(user)}
                              >
                                Editer
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                onClick={() => viewUserDetails(user)}
                              >
                                Détails
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10">
                            <UserIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-gray-500">
                              {searchTerm ? "Aucun utilisateur ne correspond à votre recherche" : "Aucun utilisateur trouvé"}
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Détails du client</DialogTitle>
            <DialogDescription>
              Informations complètes du client et ses commandes
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedUser.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p>{selectedUser.street}</p>
                      <p>{selectedUser.city}, {selectedUser.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Store className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Dépôt: {selectedUser.depot}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Inscrit le: {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Commandes du client</h3>
                {userOrders.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {userOrders.map(order => (
                      <div key={order.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">Commande #{order.id.slice(0, 8)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status === 'delivered' ? 'Livré' :
                            order.status === 'pending' ? 'En attente' : 'En cours'}
                          </span>
                        </div>
                        <p>Produit: {order.product}</p>
                        <p>Quantité: {order.quantity}</p>
                        <p>Montant: {order.amount.toLocaleString()} FC</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <Package className="h-8 w-8 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">Aucune commande trouvée</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button>Fermer</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add the Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier les informations du client</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du client ci-dessous
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom complet" 
                        {...field} 
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="example@mail.com" 
                        {...field} 
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+243 XX XXX XXXX" 
                        {...field} 
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Adresse complète" 
                        {...field} 
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ville" 
                          {...field} 
                          disabled={isUpdating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Province" 
                          {...field} 
                          disabled={isUpdating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="depot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dépôt</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom du dépôt" 
                        {...field} 
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Mise à jour..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}