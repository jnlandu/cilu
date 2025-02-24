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

interface OrderDialogProps {
  productName: string
}

export function OrderDialog({ productName }: OrderDialogProps) {
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
            <Input
              id="location"
              className="col-span-3"
              placeholder="Adresse de livraison"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Confirmer la commande</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}