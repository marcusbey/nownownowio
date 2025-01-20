"use client";

import { Button } from "@/components/ui/button";
import { SignUpProviders } from "@/app/auth/signup/SignUpProviders";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth/helper";
import { ClientHero } from "./ClientHero";

export async function Hero() {
  const user = await auth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-900">
      <ClientHero>
        {!user && (
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
            <SignUpProviders />
          </div>
        )}
      </ClientHero>
    </div>
  );
}
