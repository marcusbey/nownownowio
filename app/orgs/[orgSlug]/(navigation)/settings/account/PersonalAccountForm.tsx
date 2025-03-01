"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@prisma/client";
import { Save } from "lucide-react";
import { Button } from "@/components/core/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PersonalAccountFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
  };
}

export function PersonalAccountForm({ user }: PersonalAccountFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [isChanged, setIsChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hasNameChanged = name !== user.name && name.trim() !== "";
    const hasEmailChanged = email !== user.email && email.trim() !== "";
    setIsChanged(hasNameChanged || hasEmailChanged);
  }, [name, email, user.name, user.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isChanged) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() !== user.name ? name : undefined,
          email: email.trim() !== user.email ? email : undefined,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update account");
      }
      
      toast.success("Account updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || "User"} />
            ) : (
              <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <CardDescription>
              Update your account details and preferences
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium mb-2 block">
              Name
            </label>
            <div className="relative">
              <input 
                id="name"
                type="text" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="text-sm font-medium mb-2 block">
              Email
            </label>
            <div className="relative">
              <input 
                id="email"
                type="email" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
              />
            </div>
            {!user.emailVerified && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-amber-500/20 text-amber-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Email not verified. Please verify your email.</span>
                <Link 
                  href="/account/verify-email" 
                  className="ml-auto text-xs font-medium underline"
                >
                  Verify Email
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={!isChanged || isSubmitting}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 w-40"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
