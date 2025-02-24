'use client'

import { useState } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CONGO_SITES } from "@/data/sites"

interface OrderDialogProps {
  productName: string
}

export function OrderDialog({ productName }: OrderDialogProps) {
  const [site, setSite] = useState<string>("")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="mt-4">
          Commander
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Commander {productName}</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour passer votre commande.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantité
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              className="col-span-3"
              placeholder="Nombre de sacs"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Lieu
            </Label>
            <Select onValueChange={setSite} value={site}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez une ville" />
              </SelectTrigger>
              <SelectContent>
                {CONGO_SITES.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Confirmer la commande</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}