'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, UserRound, Mail, Phone, Home, MapPin, Building, Package, KeyRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const signupSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
  street: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  province: z.string().min(2, "La province doit contenir au moins 2 caractères"),
  depot: z.string().min(2, "Le nom du dépôt est requis"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      street: "",
      city: "",
      province: "",
      depot: "",
      phone: "",
    },
  })

  async function onSubmit(data: SignupValues) {
    setIsLoading(true)
    try {
      // Send all user data to backend
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          street: data.street,
          city: data.city,
          province: data.province,
          depot: data.depot,
          phone: data.phone,
        }),
      })

      if (response.ok) {
        const { user } = await response.json()
        toast({
          variant: "default",
          description: "Inscription réussie!"
        })
        router.push("/auth/login/")
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          description: error.message || "Une erreur est survenue"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Une erreur est survenue"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <Link
        href="/"
        className="fixed left-4 top-4 md:left-8 md:top-8 text-sm flex items-center gap-1 text-muted-foreground hover:text-primary z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Retour
      </Link>

      <div className="max-w-5xl mx-auto pt-12 pb-4">
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="md:grid md:grid-cols-5">
            {/* Left section - decorative background for larger screens */}
            <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Bienvenue chez CILU</h2>
                  <p className="mt-4 text-blue-100">
                    Créer un compte vous permet d'accéder à nos produits et services de qualité.
                  </p>
                </div>
                <div className="mt-8">
                  <p className="text-sm text-blue-100">
                    Déjà un compte?
                  </p>
                  <Link 
                    href="/auth/login"
                    className="inline-flex mt-2 text-white hover:text-blue-100 font-medium"
                  >
                    Se connecter →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right section - form */}
            <div className="md:col-span-3">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
                <CardDescription className="text-center">
                  Remplissez le formulaire pour vous inscrire
                </CardDescription>
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="max-h-[60vh] overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                      {/* Personal Information Section */}
                      <div>
                        <h3 className="font-medium text-sm text-gray-500 mb-3">Informations personnelles</h3>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <UserRound className="w-4 h-4" />
                                  Nom complet
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Mayala Francis"
                                    disabled={isLoading}
                                    className="border-gray-300"
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
                                <FormLabel className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  Email
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="mayala@example.com"
                                    disabled={isLoading}
                                    className="border-gray-300"
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
                                <FormLabel className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  Téléphone
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="tel"
                                    placeholder="+243 XX XXX XXXX"
                                    disabled={isLoading}
                                    className="border-gray-300"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Address Section */}
                      <div className="pt-2">
                        <h3 className="font-medium text-sm text-gray-500 mb-3">Adresse de livraison</h3>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Home className="w-4 h-4" />
                                  Adresse
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="123 Avenue Example"
                                    disabled={isLoading}
                                    className="border-gray-300"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    Ville
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Kinshasa"
                                      disabled={isLoading}
                                      className="border-gray-300"
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
                                  <FormLabel className="flex items-center gap-1">
                                    <Building className="w-4 h-4" />
                                    Province
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Kinshasa"
                                      disabled={isLoading}
                                      className="border-gray-300"
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
                                <FormLabel className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  Nom du dépôt
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nom du dépôt le plus proche"
                                    disabled={isLoading}
                                    className="border-gray-300"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Password Section */}
                      <div className="pt-2">
                        <h3 className="font-medium text-sm text-gray-500 mb-3">Sécurité</h3>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <KeyRound className="w-4 h-4" />
                                  Mot de passe
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showPassword ? "text" : "password"}
                                      disabled={isLoading}
                                      className="border-gray-300"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <KeyRound className="w-4 h-4" />
                                  Confirmer le mot de passe
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showConfirmPassword ? "text" : "password"}
                                      disabled={isLoading}
                                      className="border-gray-300"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 py-4 border-t flex flex-col">
                    <Button 
                      className="w-full" 
                      type="submit"
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? "Inscription en cours..." : "Créer mon compte"}
                    </Button>
                    <div className="mt-4 text-center text-sm text-muted-foreground md:hidden">
                      Déjà un compte?{" "}
                      <Link 
                        href="/auth/login"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Se connecter
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}