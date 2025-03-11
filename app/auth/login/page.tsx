'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Mail, KeyRound, User } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

const ROLES = [
  { id: 'user', label: 'Utilisateur' },
  { id: 'admin', label: 'Administrateur' }
] as const

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  role: z.string().min(1, "Veuillez sélectionner un rôle"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: "user",
    },
  })

  async function onSubmit(data: LoginValues) {
    setIsLoading(true)
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
  
      const responseData = await response.json();
  
      if (response.ok) {
        toast({
          variant: "default",
          description: "Connexion réussie!"
        })
        // Route based on role
        if (responseData.role === 'admin') {
          router.push(`/dashboard/admin/${responseData.id}`)
        } else {
          router.push(`/dashboard/users/${responseData.id}`)
        }
      } else {
        toast({
          variant: "destructive",
          description: responseData.error || "Email ou mot de passe incorrect"
        })
      }
    } catch (error) {
      // This is for network errors, not API response errors
      toast({
        variant: "destructive",
        description: "Une erreur de connexion est survenue"
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

      <div className="max-w-5xl mx-auto py-12">
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="md:grid md:grid-cols-5">
            {/* Left section - decorative background for larger screens */}
            <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Bienvenue chez CILU</h2>
                  <p className="mt-4 text-blue-100">
                    Connectez-vous pour accéder à votre compte et gérer vos commandes.
                  </p>
                </div>
                <div className="mt-8">
                  <p className="text-sm text-blue-100">
                    Pas encore de compte?
                  </p>
                  <Link 
                    href="/auth/signup"
                    className="inline-flex mt-2 text-white hover:text-blue-100 font-medium"
                  >
                    S'inscrire →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right section - form */}
            <div className="md:col-span-3">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
                <CardDescription className="text-center">
                  Entrez vos identifiants pour accéder à votre compte
                </CardDescription>
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="px-6 py-4">
                    <div className="space-y-4">
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
                                placeholder="exemple@mail.com"
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
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Rôle
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300">
                                  <SelectValue placeholder="Sélectionner votre rôle" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ROLES.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 py-4 border-t flex flex-col">
                    <Button 
                      className="w-full" 
                      type="submit"
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? "Connexion..." : "Se connecter"}
                    </Button>

                    <div className="mt-4 text-center space-y-2 text-sm">
                      <Link 
                        href="/auth/forgot-password"
                        className="text-blue-600 hover:text-blue-800 inline-block"
                      >
                        Mot de passe oublié?
                      </Link>
                      
                      <div className="text-muted-foreground md:hidden">
                        Pas encore de compte?{" "}
                        <Link 
                          href="/auth/signup" 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          S'inscrire
                        </Link>
                      </div>
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