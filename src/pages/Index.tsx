
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const Index = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Bienvenue sur CiluMarket",
      description: "Découvrez nos produits de qualité.",
    });
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
    </main>
  );
};

export default Index;
