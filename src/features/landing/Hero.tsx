import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ClientHero } from "./ClientHero";
import { AuthCheck } from "./AuthCheck";

export async function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-900">
      <ClientHero>
        <AuthCheck />
      </ClientHero>
    </div>
  );
}
