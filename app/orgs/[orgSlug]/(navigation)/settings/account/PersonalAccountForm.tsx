"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDisplayName, generateUsername, isUsernameAvailable, isValidUsernameFormat } from "@/lib/format/display-name";
import { Check } from "lucide-react";
// import { User } from "@prisma/client";
import { Save, KeyRound } from "lucide-react";
import { Button } from "@/components/core/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/core/input";

type PersonalAccountFormProps = {
  user: {
    id: string;
    name: string | null;
    displayName: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    passwordHash?: string | null;
  };
  isEmailVerified?: boolean;
}

export function PersonalAccountForm({ user, isEmailVerified = false }: PersonalAccountFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(user.name ?? "");
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const hasUsernameChanged = username !== user.name && username.trim() !== "";
    const hasDisplayNameChanged = displayName !== user.displayName && displayName.trim() !== "";
    const hasEmailChanged = email !== user.email && email.trim() !== "";
    setIsChanged(hasUsernameChanged || hasDisplayNameChanged || hasEmailChanged);
  }, [username, displayName, email, user.name, user.displayName, user.email]);
  
  // Check if user has a password set
  const hasPasswordSet = !!user.passwordHash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isChanged) return;
    
    // Validate username format
    if (displayName && !isValidUsernameFormat(displayName)) {
      setUsernameError("Username must be 3-30 characters, start with a letter, and contain only letters, numbers, and underscores.");
      return;
    }
    
    // Check if username is available (only if it changed)
    if (displayName && displayName !== user.displayName) {
      setIsCheckingUsername(true);
      try {
        const available = await isUsernameAvailable(displayName);
        if (!available) {
          setUsernameError("This username is already taken. Please choose another one.");
          setIsCheckingUsername(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
        setUsernameError("An error occurred while checking username availability.");
        setIsCheckingUsername(false);
        return;
      }
      setIsCheckingUsername(false);
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/v1/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username.trim() !== user.name ? username : undefined,
          displayName: displayName.trim() !== user.displayName ? displayName : undefined,
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
          <Avatar className="size-16">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name ?? "User"} />
            ) : (
              <AvatarFallback>{user.name?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <CardDescription>
              {formatDisplayName(user)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="text-sm font-medium mb-2 block">
              Username
            </label>
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="relative w-full">
                  <input 
                    id="displayName"
                    type="text" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={displayName}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setDisplayName(newValue);
                      setUsernameError("");
                      setIsUsernameValid(isValidUsernameFormat(newValue));
                    }}
                    onBlur={async () => {
                      setHasBlurred(true);
                      if (displayName && displayName !== user.displayName) {
                        if (!isValidUsernameFormat(displayName)) {
                          setUsernameError("Username must be 3-30 characters, start with a letter, and contain only letters, numbers, and underscores.");
                          setIsUsernameValid(false);
                          return;
                        }
                        
                        setIsCheckingUsername(true);
                        try {
                          const available = await isUsernameAvailable(displayName);
                          setIsUsernameValid(available);
                          if (!available) {
                            setUsernameError("This username is already taken.");
                          }
                        } catch {
                          setIsUsernameValid(false);
                        } finally {
                          setIsCheckingUsername(false);
                        }
                      }
                    }}
                    placeholder="Your public username"
                    disabled={isCheckingUsername}
                  />
                  {isUsernameValid && hasBlurred && displayName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <Check className="size-4" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-4"
                  onClick={async () => {
                    setIsCheckingUsername(true);
                    try {
                      // Generate a username based on the user's name or email
                      const generatedUsername = generateUsername(user);
                      
                      // Check if the username is available
                      const isAvailable = await isUsernameAvailable(generatedUsername);
                      
                      if (isAvailable) {
                        setDisplayName(generatedUsername);
                        setUsernameError("");
                        setIsChanged(true);
                        setIsUsernameValid(true);
                        setHasBlurred(true);
                      } else {
                        // Try again with a different random number
                        const retryUsername = `${generatedUsername.replace(/\d+$/, '')}${Math.floor(Math.random() * 900) + 100}`;
                        const retryAvailable = await isUsernameAvailable(retryUsername);
                        
                        if (retryAvailable) {
                          setDisplayName(retryUsername);
                          setUsernameError("");
                          setIsChanged(true);
                          setIsUsernameValid(true);
                          setHasBlurred(true);
                        } else {
                          setUsernameError("Could not generate a unique username. Please try a different name.");
                          setIsUsernameValid(false);
                        }
                      }
                    } catch {
                      // Show user-friendly message on error
                      setUsernameError("An error occurred while generating a username.");
                      setIsUsernameValid(false);
                    } finally {
                      setIsCheckingUsername(false);
                    }
                  }}
                  disabled={isCheckingUsername}
                >
                  {isCheckingUsername ? "Generating..." : "Generate"}
                </Button>
              </div>
              {usernameError && (
                <p className="text-sm text-destructive mt-1">{usernameError}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="username" className="text-sm font-medium mb-2 block">
              Name
            </label>
            <div className="relative">
              <input 
                id="username"
                type="text" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your real name"
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
            {!isEmailVerified && !user.emailVerified && user.email && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-amber-500/20 text-amber-600 text-sm">
                <AlertTriangle className="size-4" />
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
              <Save className="size-4" />
              Save Changes
            </Button>
          </div>
        </form>

        <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-medium">{hasPasswordSet ? 'Change Password' : 'Set Password'}</h3>
                <p className="text-sm text-muted-foreground">
                  {hasPasswordSet 
                    ? 'Update your password to keep your account secure' 
                    : 'Set a password to also log in with email and password'}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowSetPassword(!showSetPassword)}
                className="flex items-center gap-2"
              >
                <KeyRound className="size-4" />
                {showSetPassword ? 'Cancel' : hasPasswordSet ? 'Change Password' : 'Set Password'}
              </Button>
            </div>

            {showSetPassword && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setPasswordError("");
                
                if (newPassword.length < 8) {
                  setPasswordError("Password must be at least 8 characters");
                  return;
                }
                
                if (newPassword !== confirmPassword) {
                  setPasswordError("Passwords don't match");
                  return;
                }
                
                setIsSubmitting(true);
                
                try {
                  const response = await fetch("/api/v1/user/set-password", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      newPassword,
                      confirmPassword,
                    }),
                  });
                  
                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Failed to set password");
                  }
                  
                  toast.success("Password set successfully");
                  setShowSetPassword(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  // Force a refresh to update the UI with the new password state
                  router.refresh();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Failed to set password");
                } finally {
                  setIsSubmitting(false);
                }
              }} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="text-sm font-medium mb-2 block">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium mb-2 block">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full"
                  />
                </div>
                
                {passwordError && (
                  <div className="text-sm text-red-500">{passwordError}</div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !newPassword || !confirmPassword}
                    className="flex items-center justify-center gap-2"
                  >
                    {user.passwordHash ? 'Change Password' : 'Set Password'}
                  </Button>
                </div>
              </form>
            )}
          </div>
      </CardContent>
    </Card>
  );
}
